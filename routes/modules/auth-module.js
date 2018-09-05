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

var path = 'D:\\EZEIDBanner\\';
var EZEIDEmail = 'noreply@ezeone.com';
var moment = require('moment');

var zlib = require('zlib');
var AES_256_encryption = require('../encryption/encryption.js');
var encryption = new AES_256_encryption();

//var NotificationMqtt = require('./notification/notification-mqtt.js');
//var notificationMqtt = new NotificationMqtt();
var NotificationQueryManager = require('./notification/notification-query.js');
var notificationQmManager = null;
var mailModule = require('./mail-module.js');
var mail = null;
// var CONFIG = require('../../ezeone-config.json');

var CONFIG = require('../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;

var bcrypt = null;

try {
    bcrypt = require('bcrypt');
}
catch (ex) {
    console.log('Bcrypt not found, falling back to bcrypt-nodejs');
    bcrypt = require('bcrypt-nodejs');
}
/**
 * Hashes the password for saving into database
 * @param password
 * @returns {*}
 */
function hashPassword(password) {
    if (!password) {
        return null;
    }
    try {
        var hash = bcrypt.hashSync(password, 12);
        return hash;
    }
    catch (ex) {
        console.log(ex);
    }
}

/**
 * Compare the password and the hash for authenticating purposes
 * @param password
 * @param hash
 * @returns {*}
 */
function comparePassword(password, hash) {
    if (!password) {
        return false;
    }
    if (!hash) {
        return false;
    }
    return bcrypt.compareSync(password, hash);
}

var st = null;
function Auth(db, stdLib) {
    if (stdLib) {
        st = stdLib;
        notificationQmManager = new NotificationQueryManager(db, st);
        mail = new mailModule(db, stdLib);
    }
}

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Auth.prototype.register = function (req, res, next) {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    console.log(req.body);
    var rtnMessage = {
        error: {},
        Token: '',
        IsAuthenticate: false,
        FirstName: '',
        CompanyName: '',
        Type: 0,
        Icon: '',
        tid: '',
        group_id: '',
        ezeone_id: '',
        ezeid: '',
        Verified: 0,
        SalesModuleTitle: '',
        AppointmentModuleTitle: '',
        HomeDeliveryModuleTitle: '',
        ServiceModuleTitle: '',
        CVModuleTitle: '',
        SalesFormMsg: '',
        ReservationFormMsg: '',
        HomeDeliveryFormMsg: '',
        ServiceFormMsg: '',
        CVFormMsg: '',
        SalesItemListType: '',
        RefreshInterval: '',
        MasterID: 0,
        UserModuleRights: '',
        FreshersAccepted: '',
        HomeDeliveryItemListType: '',
        PersonalEZEID: '',
        ReservationDisplayFormat: '',
        mobilenumber: '',
        isAddressSaved: '',
        isinstitute_admin: '',
        cvid: '',
        profile_status: '',
        businesssize: '',
        headcount: '',
        branch: '',
        ismnc: '',
        versionStatus: 0,
        versionMessage: "No update required for this application",
        IsIdAvailable: 1,
        availabilityMessage: "EZEOne ID is available"
    };

    /**
     * Commenting this section on request from Sujit sir
     * @type {moment|exports|module.exports}
     */

    //switch(req.platform){
    //    case 'ios':
    //        /**
    //         * If IOS version is not supported
    //         */
    //        if(req.CONFIG.VERSION_LIST.IOS.indexOf(parseInt(req.query.versionCode)) == -1){
    //            rtnMessage.versionStatus = 2;
    //            rtnMessage.versionMessage = "Please update your application to latest version to continue using it";
    //            res.send(rtnMessage);
    //            return;
    //        }
    //        else{
    //            rtnMessage.versionStatus = (req.CONFIG.VERSION_LIST.IOS.length ==
    //            (req.CONFIG.VERSION_LIST.IOS.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1;
    //        }
    //        break;
    //    case 'android':
    //        /**
    //         * If Android version is not supported
    //         */
    //        if(req.CONFIG.VERSION_LIST.ANDROID.indexOf(parseInt(req.query.versionCode)) == -1){
    //            rtnMessage.versionStatus = 2;
    //            rtnMessage.versionMessage = "Please update your application to latest version to continue using it";
    //            res.send(rtnMessage);
    //            return;
    //        }
    //        else{
    //            rtnMessage.versionStatus = (req.CONFIG.VERSION_LIST.ANDROID.length ==
    //            (req.CONFIG.VERSION_LIST.ANDROID.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1;
    //        }
    //        break;
    //    case 'web':
    //        /**
    //         * If Web version is not supported
    //         */
    //        if(req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) == -1){
    //            rtnMessage.versionStatus = 2;
    //            rtnMessage.versionMessage = "Please update your application to latest version to continue using it";
    //            res.send(rtnMessage);
    //            return;
    //        }
    //        else{
    //            rtnMessage.versionStatus = (req.CONFIG.VERSION_LIST.WEB.length ==
    //            (req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1;
    //        }
    //        break;
    //    default:
    //        rtnMessage.versionStatus = 2;
    //        rtnMessage.versionMessage = "Please update your application to latest version to continue using it";
    //        res.send(rtnMessage);
    //        return;
    //        break;
    //}


    var moment = require('moment');

    var operationType = parseInt(req.body.OperationType) ? req.body.OperationType : 0;

    var ipAddress = req.ip;
    var selectionType = (!isNaN(parseInt(req.body.SelectionType))) ? parseInt(req.body.SelectionType) : 0;
    var idtypeId = parseInt(req.body.IDTypeID);

    var ezeid = req.body.EZEID ? (req.st.alterEzeoneId(req.body.EZEID).toUpperCase()) : '';
    var password = req.body.Password;
    var firstName = req.body.FirstName ? req.body.FirstName : '';
    var lastName = req.body.LastName ? req.body.LastName : '';
    var companyName = req.body.CompanyName ? req.body.CompanyName : '';
    var jobTitle = req.body.JobTitle ? req.body.JobTitle : '';
    var categoryId = (!isNaN(parseInt(req.body.CategoryID))) ? parseInt(req.body.CategoryID) : 0;
    var functionId = (!isNaN(parseInt(req.body.FunctionID))) ? parseInt(req.body.FunctionID) : 0;
    var roleId = (!isNaN(parseInt(req.body.RoleID))) ? parseInt(req.body.RoleID) : 0;
    var languageId = (!isNaN(parseInt(req.body.LanguageID))) ? parseInt(req.body.LanguageID) : 0;
    var nameTitleId = (req.body.NameTitleID) ? req.body.NameTitleID : 0;
    var latitude = req.body.Latitude ? req.body.Latitude : 0.00;
    var longitude = req.body.Longitude ? req.body.Longitude : 0.00;
    var altitude = req.body.Altitude ? req.body.Altitude : 0.00;
    var addressLine1 = (req.body.AddressLine1) ? req.body.AddressLine1 : '';
    var addressLine2 = (req.body.AddressLine2) ? req.body.AddressLine2 : '';
    var cityTitle = req.body.CityTitle ? req.body.CityTitle : '';
    var stateId = req.body.StateID ? req.body.StateID : '';
    var countryId = req.body.CountryID ? req.body.CountryID : '';
    var postalCode = (req.body.PostalCode) ? req.body.PostalCode : '';
    var pin = req.body.PIN ? req.body.PIN : null;
    var phoneNumber = req.body.PhoneNumber;
    var mobileNumber = req.body.MobileNumber;
    var email = req.body.EMailID;
    var picture = req.body.Picture;
    var pictureFileName = (req.body.PictureFileName) ? req.body.PictureFileName : '';
    var webSite = req.body.Website ? req.body.Website : '';
    var aboutCompany = req.body.AboutCompany; //tag line of company
    var token = req.body.Token ? req.body.Token : '';
    var operation = "I";
    if (token) {
        operation = "U";
    }

    var isdPhoneNumber = req.body.ISDPhoneNumber ? req.body.ISDPhoneNumber : '';
    var isdMobileNumber = req.body.ISDMobileNumber ? req.body.ISDMobileNumber : '';
    var parkingStatus = req.body.ParkingStatus ? req.body.ParkingStatus : 0;
    var gender = (!isNaN(parseInt(req.body.Gender))) ? parseInt(req.body.Gender) : 2;
    var dob = (req.body.DOB) ? (req.body.DOB) : '';
    if (idtypeId != 1) {
        dob = moment().format('YYYY-MM-DD');
    }

    var momentObj = moment(dob, 'YYYY-MM-DD').isValid();
    var templateId = req.body.TemplateID ? parseInt(req.body.TemplateID) : 0;
    var isIphone = req.body.device ? parseInt(req.body.device) : 0;
    var deviceToken = req.body.device_token ? req.body.device_token : '';
    var visibleEmail = (!isNaN(parseInt(req.body.ve))) ? parseInt(req.body.ve) : 1;   // 0-invisible, 1- visible
    var visibleMobile = (!isNaN(parseInt(req.body.vm))) ? parseInt(req.body.vm) : 1;  // 0-invisible, 1- visible
    var visiblePhone = (!isNaN(parseInt(req.body.vp))) ? parseInt(req.body.vp) : 1;   // 0-invisible, 1- visible
    var visibleAddress = (!isNaN(parseInt(req.body.va))) ? parseInt(req.body.va) : 1; // 0-invisible, 1- visible
    var locTitle = req.body.loc_title ? req.body.loc_title : '';
    var statusId = (!isNaN(parseInt(req.body.status_id))) ? parseInt(req.body.status_id) : 1;  // 1-active, 2-inactive
    var apUserid = (!isNaN(parseInt(req.body.ap_userid))) ? parseInt(req.body.ap_userid) : 0;
    var businessKeywords = (req.body.keywords) ? req.body.keywords : '';
    var encryptPwd = '';
    var fullName = '';
    var companyDetails = (req.body.company_details) ? req.body.company_details : ''; // about company details
    var businesssize = (req.body.businesssize) ? req.body.businesssize : 0;
    var headcount = (req.body.headcount) ? req.body.headcount : 0;
    var branch = (req.body.branch) ? req.body.branch : 0;
    var ismnc = (req.body.ismnc) ? req.body.ismnc : 0;
    var rating = (req.body.rating) ? req.body.rating : 1;
    var isWhatMate = (req.body.isWhatMate) ? req.body.isWhatMate : 0;
    var APNS_Id = (req.body.APNS_Id) ? (req.body.APNS_Id) : "";
    var GCM_Id = (req.body.GCM_Id) ? (req.body.GCM_Id) : "";
    var secretKey = (req.body.secretKey) ? (req.body.secretKey) : null;


    var validateStatus = true;
    var error = {};

    if (idtypeId == 1) {
        if (!firstName) {
            error['firstName'] = 'firstName is mandatory';
            validateStatus *= false;
            console.log('firstName is mandatory');
        }
    }
    if (idtypeId == 2 && idtypeId == 3 && idtypeId == 4) {
        error['companyName'] = 'companyName is mandatory';
        validateStatus *= false;
        console.log('companyName is mandatory');
    }

    if (momentObj) {
        dob = moment(dob).format('YYYY-MM-DD HH:mm:ss');
    }

    else {
        error['dob'] = 'dob date is wrong format';
        validateStatus *= false;
        console.log('dob date is wrong format');
    }

    if (!validateStatus) {
        rtnMessage.error = error;
        res.status(400).json(rtnMessage);

    }
    else {
        try {

            var list = req.CONFIG.RESERVED_EZEONE_LIST;

            var testCase = ezeid.replace('@', '');
            var allowedFlag = true;

            console.log('testCase', testCase);

            for (var i = 0; i < list.length; i++) {
                var reg = new RegExp(list[i], 'g');
                if (reg.test(testCase)) {
                    console.log('Test pass : Should not be allowed', testCase);
                    allowedFlag = false;
                    break;
                }
            }

            console.log('allowedFlag after change', allowedFlag);

            /**
             * If user is having token we assume he is updating the data
             * otherwise he is creating a new ezeoneId
             * there
             * @param createWorkingHoursFlag
             */

            var savePrimaryData = function (createWorkingHoursFlag) {
                if (allowedFlag) {
                    /**
                     * Register
                     */

                    if (idtypeId && ezeid) {
                        if (password) {
                            encryptPwd = req.st.hashPassword(password);
                        }
                        console.log('masterid testing1');
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
                            + ',' + st.db.escape(companyDetails) + ',' + st.db.escape(businesssize) + ',' + st.db.escape(headcount)
                            + ',' + st.db.escape(branch) + ',' + st.db.escape(ismnc) + ',' + st.db.escape(rating) + ',' + req.st.db.escape(DBSecretKey);

                        var query = 'CALL pSaveEZEIDData(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, registerResult) {
                            if (!err) {
                                console.log('registerResult', registerResult);
                                if (registerResult) {
                                    if (registerResult[0]) {
                                        if (registerResult[0].length > 0) {
                                            if (registerResult[0][0] && registerResult[0][0].TID != 0) {
                                                //if (idtypeId == 2) {
                                                //    rtnMessage.FirstName = companyName;
                                                //}
                                                //else {
                                                //    rtnMessage.FirstName = firstName;
                                                //}
                                                rtnMessage.IsAuthenticate = true;
                                                rtnMessage.Token = token;
                                                rtnMessage.Type = idtypeId;
                                                rtnMessage.tid = registerResult[0][0].TID;
                                                rtnMessage.TID = registerResult[0][0].TID;
                                                rtnMessage.group_id = registerResult[0][0].group_id;
                                                if (!registerResult[0][0].ParentMasterID) {
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
                                                        req.socket.remoteAddress;
                                                    var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';

                                                    st.generateToken(ip, userAgent, ezeid, isWhatMate, APNS_Id, GCM_Id, secretKey, function (err, token) {
                                                        if (err) {
                                                            console.log('FnRegistration: Token Generation Error' + err);
                                                        }
                                                        else {
                                                            rtnMessage.Token = token;
                                                        }
                                                        res.send(rtnMessage);
                                                    });

                                                    console.log('FnRegistration:tmaster: Registration success');

                                                    var queryParams1 = st.db.escape(pin) + ',' + st.db.escape(ezeid)
                                                        + ',' + st.db.escape('') + ',' + st.db.escape(addressLine1);
                                                    var query1 = 'CALL pupdateEZEoneKeywords(' + queryParams1 + ');';

                                                    if (createWorkingHoursFlag) {
                                                        query1 += " INSERT INTO working_hours(masterid,days,st,et) VALUES(" + st.db.escape(registerResult[0][0].TID) + ",'1,2,3,4,5',150,750);";
                                                    }

                                                    st.db.query(query1, function (err, updateResult) {
                                                        if (!err) {
                                                            console.log('FnUpdateEZEoneKeywords: Keywords Updated successfully');
                                                        }
                                                        else {
                                                            console.log('FnUpdateEZEoneKeywords: Keywords not updated');
                                                            console.log(err);
                                                        }
                                                    });


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

                                                    if (email && createWorkingHoursFlag) {

                                                        if (firstName && lastName) {
                                                            fullName = firstName + ' ' + lastName;
                                                        }
                                                        else if (firstName) {
                                                            fullName = firstName;
                                                        }
                                                        else {
                                                            fullName = companyName;
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
                                                    var queryParams3 = st.db.escape(pin) + ',' + st.db.escape(ezeid) + ',' + st.db.escape('')
                                                        + ',' + st.db.escape(addressLine1);
                                                    var query3 = 'CALL pupdateEZEoneKeywords(' + queryParams3 + ')';
                                                    console.log(query3);
                                                    st.db.query(query3, function (err, getResult) {
                                                        if (!err) {
                                                            console.log('FnUpdateEZEoneKeywords: Keywords Updated successfully');
                                                            res.send(rtnMessage);
                                                        }
                                                    });
                                                }
                                            }
                                            else {
                                                console.log('rtnMessage', rtnMessage);
                                                res.send(rtnMessage);
                                                console.log('FnRegistration:tmaster: Registration Failed..1');
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
                else {
                    /**
                     * If allowed flag is false then don't register this EZEOne and don't show availability also
                     */
                    //res.statusCode = 200;
                    res.send(rtnMessage);
                    console.log('FnRegistration:tmaster: ezeid not available');
                }
                console.log('FnCheckEzeid: tmaster:  EzeId available');
            };

            if (!token) {
                var Query = 'Select EZEID from tmaster where EZEID=' + st.db.escape(ezeid);
                st.db.query(Query, function (err, EzeidExitsResult) {
                    console.log(EzeidExitsResult, "EzeidExitsResult");
                    if (!err) {
                        if (EzeidExitsResult && EzeidExitsResult.length > 0) {
                            rtnMessage.IsIdAvailable = 0;
                            rtnMessage.availabilityMessage = "This EZEOne ID is no longer available,Please choose another EZEOne ID";
                            res.send(rtnMessage);
                            console.log('FnCheckEzeid: tmaster: EzeId exists');
                        }
                        else {
                            /**
                             * Passing working hour flag as true as
                             * we have to generate default working hour in
                             * case of new registration
                             */
                            savePrimaryData(true);
                        }
                    }
                    else {
                        res.statusCode = 500;
                        res.send(rtnMessage);
                        console.log('FnCheckEzeid: tmaster: ' + err);
                    }
                });
            }
            else {
                /**
                 * Checking if token is valid or not
                 * If token is valid then check if token belongs to the same ezeoneId which is getting updated
                 * If all above conditions get fulfilled then only save the details
                 */
                req.st.validateToken(token, function (err, tokenResult) {
                    if (tokenResult && tokenResult[0] && tokenResult[0].ezeoneId && tokenResult[0].ezeoneId == ezeid) {
                        savePrimaryData();
                    }
                    else {
                        res.statusCode = 500;
                        res.send(rtnMessage);
                        console.log('FnCheckEzeid: tmaster: ' + err);
                    }

                });

            }
        }

        catch (ex) {

            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            console.log('FnRegistration error:' + ex);
            res.statusCode = 500;
            res.send(rtnMessage);
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
Auth.prototype.login = function (req, res, next) {


    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    var ezeoneId = req.st.alterEzeoneId(req.body.UserName);
    var isDialer= req.query.isDialer ? req.query.isDialer :0;
    var password = req.body.Password;
    var isIphone = req.body.device ? parseInt(req.body.device) : 0;
    var deviceToken = req.body.device_token ? req.body.device_token : '';
    var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var token = req.body.token ? req.body.token : '';
    var code = req.body.code ? req.st.alterEzeoneId(req.body.code) : '';
    var isWhatMate = req.body.isWhatMate ? req.body.isWhatMate : 0;
    var APNS_Id = (req.body.APNS_Id) ? (req.body.APNS_Id) : "";
    var GCM_Id = (req.body.GCM_Id) ? (req.body.GCM_Id) : "";
    var secretKey = (req.body.secretKey) ? (req.body.secretKey) : null;

    var responseMessage = {
        Token: '',
        TID: '',
        IsAuthenticate: false,
        ezeone_id: '',
        FirstName: '',
        LastName: '',
        Type: 0,
        Verified: 0,
        SalesModuleTitle: '',
        AppointmentModuleTitle: '',
        HomeDeliveryModuleTitle: '',
        ServiceModuleTitle: '',
        CVModuleTitle: '',
        SalesFormMsg: '',
        ReservationFormMsg: '',
        HomeDeliveryFormMsg: '',
        ServiceFormMsg: '',
        CVFormMsg: '',
        SalesItemListType: '',
        RefreshInterval: '',
        MasterID: 0,
        UserModuleRights: '',
        VisibleModules: '',
        FreshersAccepted: '',
        HomeDeliveryItemListType: '',
        PersonalEZEID: '',
        ReservationDisplayFormat: '',
        mobilenumber: '',
        isAddressSaved: '',
        isinstitute_admin: '',
        cvid: 0,
        profile_status: '',
        userDetails: []
    };
    // if(isWhatMate == 0){
    //     switch(req.platform){
    //         case 'ios':
    //             /**
    //              * If IOS version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.IOS[0].indexOf(parseInt(req.query.versionCode)) == -1 && req.CONFIG.VERSION_LIST.IOS[1].indexOf(parseInt(req.query.versionCode)) == -1 ){
    //                 responseMessage.versionStatus = 2;
    //                 responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //                 res.send(responseMessage);
    //                 return;
    //             }
    //             else if(req.CONFIG.VERSION_LIST.IOS[1].indexOf(parseInt(req.query.versionCode)) == -1){
    //                 responseMessage.versionStatus = 1;
    //                 responseMessage.versionMessage = "New update available. Please update your application to latest version";
    //                 //res.send(responseMessage);
    //                 //return;
    //             }
    //             else{
    //                 responseMessage.versionStatus = 0;
    //                 responseMessage.versionMessage = "Applications is up to date";
    //                 //res.send(responseMessage);
    //             }
    //             break;
    //         case 'android':
    //             /**
    //              * If Android version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.ANDROID.indexOf(parseInt(req.query.versionCode)) == -1){
    //                 responseMessage.versionStatus = 2;
    //                 responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //                 res.send(responseMessage);
    //                 return;
    //             }
    //             else{
    //                 responseMessage.versionStatus = (req.CONFIG.VERSION_LIST.ANDROID.length ==
    //                 (req.CONFIG.VERSION_LIST.ANDROID.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1;
    //                 responseMessage.versionMessage = (responseMessage.versionStatus)
    //                     ? "New update available. Please update your application to latest version" : responseMessage.versionMessage;
    //
    //             }
    //             break;
    //         case 'web':
    //             /**
    //              * If Web version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) == -1){
    //                 responseMessage.versionStatus = 2;
    //                 responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //                 res.send(responseMessage);
    //                 return;
    //             }
    //             else{
    //                 responseMessage.versionStatus = (req.CONFIG.VERSION_LIST.WEB.length ==
    //                 (req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1;
    //                 responseMessage.versionMessage = (responseMessage.versionStatus)
    //                     ? "New update available. Please update your application to latest version" : responseMessage.versionMessage;
    //             }
    //             break;
    //         default:
    //             responseMessage.versionStatus = 2;
    //             responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //             res.send(responseMessage);
    //             return;
    //             break;
    //     }
    // }
    //  else{
    //     switch(req.platform){
    //         case 'ios':
    //             /**
    //              * If IOS version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.WhatMateIOS[0].indexOf(parseInt(req.query.versionCode)) == -1 && req.CONFIG.VERSION_LIST.WhatMateIOS[1].indexOf(parseInt(req.query.versionCode)) == -1 ){
    //                 responseMessage.versionStatus = 2;
    //                 responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //                 res.send(responseMessage);
    //                 return;
    //             }
    //             else if(req.CONFIG.VERSION_LIST.WhatMateIOS[1].indexOf(parseInt(req.query.versionCode)) == -1){
    //                 responseMessage.versionStatus = 1;
    //                 responseMessage.versionMessage = "New update available. Please update your application to latest version";
    //             }
    //             else{
    //                 responseMessage.versionStatus = 0;
    //                 responseMessage.versionMessage = "Applications is up to date";
    //             }
    //             break;
    //         case 'android':
    //             /**
    //              * If Android version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.WhatMateANDROID.indexOf(parseInt(req.query.versionCode)) == -1){
    //                 responseMessage.versionStatus = 2;
    //                 responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //                 res.send(responseMessage);
    //                 return;
    //             }
    //             else{
    //                 responseMessage.versionStatus = (req.CONFIG.VERSION_LIST.WhatMateANDROID.length ==
    //                 (req.CONFIG.VERSION_LIST.WhatMateANDROID.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1;
    //                 responseMessage.versionMessage = (responseMessage.versionStatus)
    //                     ? "New update available. Please update your application to latest version" : responseMessage.versionMessage;
    //
    //
    //             }
    //             break;
    //         case 'web':
    //             /**
    //              * If Web version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) == -1){
    //                 rtnMessage.data = {
    //                     versionStatus : 2,
    //                     versionMessage : "Please update your application to latest version to continue using it"
    //                 };
    //
    //                 res.json(rtnMessage);
    //                 return;
    //             }
    //             else{
    //                 rtnMessage.data = {
    //                     versionStatus : (req.CONFIG.VERSION_LIST.WEB.length ==
    //                     (req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1,
    //                     versionMessage : "New update available. Please update your application to latest version"
    //
    //                 };
    //
    //             }
    //             break;
    //         default:
    //             rtnMessage.data = {
    //                 versionStatus : 2,
    //                 versionMessage : "Please update your application to latest version to continue using it"
    //             };
    //
    //             res.json(rtnMessage);
    //             return;
    //             break;
    //     }
    // }

    try {

        if (ezeoneId && password) {

            var queryParams = st.db.escape(ezeoneId) + ',' + st.db.escape(code) + ',' + st.db.escape(token) + ',' + st.db.escape(DBSecretKey) + ',' + st.db.escape(isDialer);
            var query = 'CALL PLoginNewOld(' + queryParams + ')';
            console.log('query', query);
            st.db.query(query, function (err, loginResult) {
                console.log(loginResult);
                if (!err) {
                    if (loginResult && password) {
                        //console.log('loginDetails',loginDetails);
                        if (loginResult[0]) {
                            if (loginResult[0].length > 0) {
                                var loginDetails = loginResult[0];
                                if (!token) {
                                    if (comparePassword(password, loginDetails[0].Password)) {
                                        st.generateTokenPace(ip, userAgent, loginDetails[0].EZEID, isWhatMate, APNS_Id, GCM_Id, secretKey, isDialer, function (err, tokenResult) {
                                            if ((!err) && tokenResult && loginDetails[0]) {
                                                var APNSID = req.query.APNSID ? req.query.APNSID : '';
                                                var GCMID = req.query.GCMID ? req.query.GCMID : '';
                                                console.log('CALL pGetEZEIDDetails(' + st.db.escape(tokenResult) + ',' + st.db.escape(DBSecretKey) + ',' + st.db.escape(APNSID) + ',' + st.db.escape(GCMID) + ',' + st.db.escape(APNSID) +  ')');
                                                st.db.query('CALL pGetEZEIDDetailsPace(' + st.db.escape(tokenResult) + ',' + st.db.escape(DBSecretKey) + ',' + st.db.escape(APNSID) + ',' + st.db.escape(GCMID) + ',' + st.db.escape(isDialer) + ')', function (err, UserDetailsResult) {
                                                    if (!err) {
                                                        var procParams = [
                                                            req.db.escape(tokenResult),
                                                            req.db.escape(null),
                                                            req.db.escape(DBSecretKey),
                                                            req.db.escape(isDialer)

                                                        ];
                                                        var procQuery = 'CALL pGetGroupAndIndividuals_newPace(' + procParams.join(' ,') + ')';
                                                        console.log(procQuery);
                                                        req.db.query(procQuery, function (err, contactResult) {
                                                            if (!err) {
                                                                if (UserDetailsResult[0] && UserDetailsResult[0][0]) {

                                                                    UserDetailsResult[0][0].Picture = (UserDetailsResult[0][0].Picture) ?
                                                                        (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + UserDetailsResult[0][0].Picture) : '';

                                                                    /**
                                                                     * Every time the user loads the website the browser sends the cookie back to the server to notify the user previous activity
                                                                     */
                                                                    res.cookie('Token', tokenResult, {
                                                                        maxAge: 900000,
                                                                        httpOnly: true
                                                                    });
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
                                                                    responseMessage.LastName = loginDetails[0].LastName;
                                                                    if (loginDetails[0].ParentMasterID == 0) {
                                                                        responseMessage.MasterID = loginDetails[0].TID;
                                                                    }
                                                                    else {
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
                                                                    responseMessage.isHelloEZE = loginDetails[0].isHelloEZE;
                                                                    responseMessage.isWMAdmin = loginDetails[0].isWMAdmin;
                                                                    responseMessage.displayName = loginDetails[0].displayName;
                                                                    responseMessage.whatMateCount = loginDetails[0].whatMateCount;
                                                                    responseMessage.isEmployee = loginDetails[0].isEmployee;
                                                                    responseMessage.userDetails = UserDetailsResult[0];
                                                                    if (UserDetailsResult[0] && UserDetailsResult[0][0]) {
                                                                        responseMessage.contactDetails = contactResult[0];
                                                                    }
                                                                    else {
                                                                        responseMessage.contactDetails = null;
                                                                    }

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
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                            else {

                                                res.statusCode = 500;
                                                res.send(responseMessage);
                                                console.log('FnLogin:failed to generate a token ');
                                                console.log('FnLogin:' + err);
                                            }
                                        });
                                    }
                                    else {
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
                                    if (loginDetails[0].ParentMasterID == 0) {
                                        responseMessage.MasterID = loginDetails[0].TID;
                                    }
                                    else {
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
                                    responseMessage.cvid = loginDetails[0].cvid;
                                    responseMessage.profile_status = loginDetails[0].ps;
                                    responseMessage.isHelloEZE = loginDetails[0].isHelloEZE;
                                    responseMessage.isWMAdmin = loginDetails[0].isWMAdmin;

                                    res.send(responseMessage);

                                    // res.send(responseMessage);
                                }
                            }
                            else {
                                res.send(responseMessage);
                                console.log('FnLogin:login result not found');
                            }
                        }
                        else {
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
        console.log('FnLogin:: error:' + ex);

    }
};

/**
 * @todo FnLogout
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Auth.prototype.logout = function (req, res, next) {

    var _this = this;
    try {

        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

        var token = req.query.Token;
        var isIphone = req.query.device ? parseInt(req.query.device) : 0;
        var isDialer = req.query.isDialer ? (req.query.isDialer) : 0;

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
                console.log("queryParameter", queryParameter);


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
                                        var query1 = 'CALL pLogout(' + st.db.escape(token) +')';
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
                            else {
                                console.log('FnDeleteIphoneID:details is not found');
                            }
                        });
                    }
                    else {
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
        console.log('FnLogout error:' + ex);

    }
};

/**
 * Verify Password reset code (expiry 24 hrs) and generates a new secret code which expires in 5 minutes
 * @method GET
 *
 * @service-param ezeone_id <string>
 * @service-param reset_code <string>
 */

Auth.prototype.verifyResetCode = function (req, res, next) {
    var ezeoneId = req.st.alterEzeoneId(req.query.ezeone_id);
    var resetCode = req.query.reset_code;

    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';


    var statusFlag = true;
    var error = {};
    var respMsg = {
        status: false,
        message: 'Invalid password reset link',
        data: null,
        error: null
    }

    if (!ezeoneId) {
        statusFlag *= false;
        error['ezeone_id'] = 'Invalid EZEOne ID';
    }

    if (!resetCode) {
        statusFlag *= false;
        error['reset_code'] = 'Invalid Reset Code';
    }

    if (statusFlag) {
        try {
            var queryParams = st.db.escape(ezeoneId) + ',' + st.db.escape(resetCode) + ',' + st.db.escape(DBSecretKey);
            var query = 'CALL pverifyresetcode(' + queryParams + ')';

            //console.log(query);

            st.db.query(query, function (err, verifyRes) {
                if (err) {
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                    console.log('audit-module -> verifyResetCode : Error in PROCEDURE pverifyresetcode');
                    console.log(err);
                    console.log('audit-module -> verifyResetCode : params - 1. ezeone_id : ' +
                        req.query.ezeone_id + ' 2. reset_code : ' + req.query.reset_code + ' IP Address : ' + ip + ' UserAgent : ' + userAgent);
                    respMsg.error = { server: 'Internal Server Error' };
                    respMsg.message = "Internal Server Error";
                    respMsg.data = null;
                    respMsg.status = false;
                    res.status(500).json(respMsg);
                }

                else {
                    //console.log(verifyRes);

                    if (verifyRes) {
                        if (verifyRes[0]) {
                            if (verifyRes[0][0]) {
                                if (verifyRes[0][0].tid) {
                                    respMsg.status = true;
                                    respMsg.data = {
                                        tid: verifyRes[0][0].tid,
                                        reset_otp: verifyRes[0][0].secreate_code
                                    };
                                    respMsg.message = 'Reset code is valid ! Proceed to reset password';
                                    respMsg.error = null;
                                    res.status(200).json(respMsg);
                                }
                                else {
                                    res.status(200).json(respMsg);
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
                    else {
                        respMsg.status = true;
                        respMsg.error = null;
                        respMsg.message = "Successfully verified reset code";
                        respMsg.data = {
                            valid: true,
                            result: verifyRes
                        };
                        res.status(200).json(respMsg);
                    }
                }

            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            console.log('audit-module -> verifyResetCode : Exception');
            console.log(ex);
            console.log('audit-module -> verifyResetCode : params - 1. ezeone_id : ' +
                req.query.ezeone_id + ' 2. reset_code : ' + req.query.reset_code + ' IP Address : ' + ip + ' UserAgent : ' + userAgent);
            respMsg.error = { server: 'Internal Server Error' };
            respMsg.message = "Internal Server Error";
            respMsg.data = null;
            respMsg.status = false;
            res.status(500).json(respMsg);
        }
    }
    else {
        console.log('audit-module -> verifyResetCode : Unable to verify password reset link');
        console.log('audit-module -> verifyResetCode : params - 1. ezeone_id : ' +
            req.query.ezeone_id + ' 2. reset_code : ' + req.query.reset_code + ' IP Address : ' + ip + ' UserAgent : ' + userAgent);
        res.status(200).json(respMsg);
    }
};

Auth.prototype.verifySecretCode = function (req, res, next) {

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
            req.body.ezeone_id = req.st.alterEzeoneId(req.body.ezeone_id);
            var queryParams = st.db.escape(req.body.secret_code) + ',' + st.db.escape(req.body.ezeone_id) + ',' + st.db.escape(req.st.hashPassword(req.body.new_password));
            var verifyQuery = 'CALL pverifySecretcode(' + queryParams + ')';

            //console.log(verifyQuery);

            st.db.query(verifyQuery, function (err, verifyRes) {
                if (err) {
                    console.log('Error in verifyQuery : FnVerifySecretCode ');
                    console.log(err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                    respMsg.error = { server: 'Internal Server Error' };
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

                    if (verifyRes) {
                        if (verifyRes.affectedRows) {
                            respMsg.status = true;
                            respMsg.error = null;
                            respMsg.data = null;
                            respMsg.message = "Password reset process is completed successfully";
                            res.status(200).json(respMsg);
                        }
                        else {
                            respMsg.status = false;
                            respMsg.error = { secret_code: 'Session Expired ! Please try again' };
                            respMsg.data = null;
                            respMsg.message = "Session Expired ! Please try again";
                            res.status(200).json(respMsg);
                        }
                    }
                    else {
                        respMsg.status = false;
                        respMsg.error = { secret_code: 'Session Expired ! Please try again' };
                        respMsg.data = null;
                        respMsg.message = "Session Expired ! Please try again";
                        res.status(200).json(respMsg);
                    }
                }
            });
        }
        catch (ex) {
            console.log('Error : FnVerifySecretCode ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            respMsg.error = { server: 'Internal Server Error' };
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

Auth.prototype.sendOtp = function (req, res, next) {

    var request = require('request');
    var mobileNo = req.body.mn;

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
            else {
                respMsg.message = 'Sorry! mobile number is not valid';
                console.log('invalid mobile number');
                res.status(200).json(respMsg);
            }

        }
        catch (ex) {
            console.log('Error : FnSendOtp ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            respMsg.error = { server: 'Internal Server Error' };
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
 * @todo FnLogin
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Auth.prototype.loginNew = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    // var ezeoneId = req.st.alterEzeoneId(req.body.UserName);

    // var password = req.body.Password;
    // var isIphone = req.body.device ? parseInt(req.body.device) : 0;
    // var deviceToken = req.body.device_token ? req.body.device_token : '';
    var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var token = req.query.token ? req.query.token : ''; // token in query now
    // var code = req.body.code ? req.st.alterEzeoneId(req.body.code) : '';
    // var isWhatMate = req.body.isWhatMate ? req.body.isWhatMate : 0;
    // var APNS_Id = (req.body.APNS_Id) ? (req.body.APNS_Id) : "";
    // var GCM_Id = (req.body.GCM_Id) ? (req.body.GCM_Id) : "";
    // var secretKey = (req.body.secretKey) ? (req.body.secretKey) : null;
    // console.log("secretKey",secretKey);

    var responseMessage = {
        Token: '',
        TID: '',
        IsAuthenticate: false,
        ezeone_id: '',
        FirstName: '',
        LastName: '',
        Type: 0,
        Verified: 0,
        SalesModuleTitle: '',
        AppointmentModuleTitle: '',
        HomeDeliveryModuleTitle: '',
        ServiceModuleTitle: '',
        CVModuleTitle: '',
        SalesFormMsg: '',
        ReservationFormMsg: '',
        HomeDeliveryFormMsg: '',
        ServiceFormMsg: '',
        CVFormMsg: '',
        SalesItemListType: '',
        RefreshInterval: '',
        MasterID: 0,
        UserModuleRights: '',
        VisibleModules: '',
        FreshersAccepted: '',
        HomeDeliveryItemListType: '',
        PersonalEZEID: '',
        ReservationDisplayFormat: '',
        mobilenumber: '',
        isAddressSaved: '',
        isinstitute_admin: '',
        cvid: 0,
        profile_status: '',
        userDetails: []

    };
    // if(isWhatMate == 0){
    //     switch(req.platform){
    //         case 'ios':
    //             /**
    //              * If IOS version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.IOS[0].indexOf(parseInt(req.query.versionCode)) == -1 && req.CONFIG.VERSION_LIST.IOS[1].indexOf(parseInt(req.query.versionCode)) == -1 ){
    //                 responseMessage.versionStatus = 2;
    //                 responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //                 res.send(responseMessage);
    //                 return;
    //             }
    //             else if(req.CONFIG.VERSION_LIST.IOS[1].indexOf(parseInt(req.query.versionCode)) == -1){
    //                 responseMessage.versionStatus = 1;
    //                 responseMessage.versionMessage = "New update available. Please update your application to latest version";
    //                 //res.send(responseMessage);
    //                 //return;
    //             }
    //             else{
    //                 responseMessage.versionStatus = 0;
    //                 responseMessage.versionMessage = "Applications is up to date";
    //                 //res.send(responseMessage);
    //             }
    //             break;
    //         case 'android':
    //             /**
    //              * If Android version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.ANDROID.indexOf(parseInt(req.query.versionCode)) == -1){
    //                 responseMessage.versionStatus = 2;
    //                 responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //                 res.send(responseMessage);
    //                 return;
    //             }
    //             else{
    //                 responseMessage.versionStatus = (req.CONFIG.VERSION_LIST.ANDROID.length ==
    //                 (req.CONFIG.VERSION_LIST.ANDROID.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1;
    //                 responseMessage.versionMessage = (responseMessage.versionStatus)
    //                     ? "New update available. Please update your application to latest version" : responseMessage.versionMessage;
    //
    //             }
    //             break;
    //         case 'web':
    //             /**
    //              * If Web version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) == -1){
    //                 responseMessage.versionStatus = 2;
    //                 responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //                 res.send(responseMessage);
    //                 return;
    //             }
    //             else{
    //                 responseMessage.versionStatus = (req.CONFIG.VERSION_LIST.WEB.length ==
    //                 (req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1;
    //                 responseMessage.versionMessage = (responseMessage.versionStatus)
    //                     ? "New update available. Please update your application to latest version" : responseMessage.versionMessage;
    //             }
    //             break;
    //         default:
    //             responseMessage.versionStatus = 2;
    //             responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //             res.send(responseMessage);
    //             return;
    //             break;
    //     }
    // }
    //  else{
    //     switch(req.platform){
    //         case 'ios':
    //             /**
    //              * If IOS version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.WhatMateIOS[0].indexOf(parseInt(req.query.versionCode)) == -1 && req.CONFIG.VERSION_LIST.WhatMateIOS[1].indexOf(parseInt(req.query.versionCode)) == -1 ){
    //                 responseMessage.versionStatus = 2;
    //                 responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //                 res.send(responseMessage);
    //                 return;
    //             }
    //             else if(req.CONFIG.VERSION_LIST.WhatMateIOS[1].indexOf(parseInt(req.query.versionCode)) == -1){
    //                 responseMessage.versionStatus = 1;
    //                 responseMessage.versionMessage = "New update available. Please update your application to latest version";
    //             }
    //             else{
    //                 responseMessage.versionStatus = 0;
    //                 responseMessage.versionMessage = "Applications is up to date";
    //             }
    //             break;
    //         case 'android':
    //             /**
    //              * If Android version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.WhatMateANDROID.indexOf(parseInt(req.query.versionCode)) == -1){
    //                 responseMessage.versionStatus = 2;
    //                 responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //                 res.send(responseMessage);
    //                 return;
    //             }
    //             else{
    //                 responseMessage.versionStatus = (req.CONFIG.VERSION_LIST.WhatMateANDROID.length ==
    //                 (req.CONFIG.VERSION_LIST.WhatMateANDROID.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1;
    //                 responseMessage.versionMessage = (responseMessage.versionStatus)
    //                     ? "New update available. Please update your application to latest version" : responseMessage.versionMessage;
    //
    //
    //             }
    //             break;
    //         case 'web':
    //             /**
    //              * If Web version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) == -1){
    //                 rtnMessage.data = {
    //                     versionStatus : 2,
    //                     versionMessage : "Please update your application to latest version to continue using it"
    //                 };
    //
    //                 res.json(rtnMessage);
    //                 return;
    //             }
    //             else{
    //                 rtnMessage.data = {
    //                     versionStatus : (req.CONFIG.VERSION_LIST.WEB.length ==
    //                     (req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1,
    //                     versionMessage : "New update available. Please update your application to latest version"
    //
    //                 };
    //
    //             }
    //             break;
    //         default:
    //             rtnMessage.data = {
    //                 versionStatus : 2,
    //                 versionMessage : "Please update your application to latest version to continue using it"
    //             };
    //
    //             res.json(rtnMessage);
    //             return;
    //             break;
    //     }
    // }

    try {

        var ezeoneId = req.st.alterEzeoneId(req.body.UserName);

        var password = req.body.Password;
        var isIphone = req.body.device ? parseInt(req.body.device) : 0;
        var deviceToken = req.body.device_token ? req.body.device_token : '';
        var code = req.body.code ? req.st.alterEzeoneId(req.body.code) : '';
        var isWhatMate = req.body.isWhatMate ? req.body.isWhatMate : 0;
        var APNS_Id = (req.body.APNS_Id) ? (req.body.APNS_Id) : "";
        var GCM_Id = (req.body.GCM_Id) ? (req.body.GCM_Id) : "";
        var secretKey = (req.body.secretKey) ? (req.body.secretKey) : null;
        var isDialer= req.query.isDialer ? req.query.isDialer :0;
        console.log("secretKey", secretKey);

        if (ezeoneId && password) {

            var queryParams = st.db.escape(ezeoneId) + ',' + st.db.escape(code) + ',' + st.db.escape(token) + ',' + st.db.escape(DBSecretKey) + ',' + st.db.escape(isDialer);
            var query = 'CALL PLoginNew(' + queryParams + ')';
            console.log('query', query);
            st.db.query(query, function (err, loginResult) {
                // console.log(loginResult);
                if (!err) {
                    if (loginResult && password) {
                        //console.log('loginDetails',loginDetails);
                        if (loginResult[0]) {
                            if (loginResult[0].length > 0) {
                                var loginDetails = loginResult[0];
                                if (!token) {
                                    if (comparePassword(password, loginDetails[0].Password)) {
                                        st.generateToken(ip, userAgent, loginDetails[0].EZEID, isWhatMate, APNS_Id, GCM_Id, secretKey, isDialer, function (err, tokenResult) {
                                            if ((!err) && tokenResult && loginDetails[0]) {
                                                var APNSID = req.query.APNSID ? req.query.APNSID : '';
                                                var GCMID = req.query.GCMID ? req.query.GCMID : '';
                                                st.db.query('CALL pGetEZEIDDetails(' + st.db.escape(tokenResult) + ',' + st.db.escape(DBSecretKey) + ',' + st.db.escape(APNSID) + ',' + st.db.escape(GCMID) + ',' + st.db.escape(isDialer) + ')', function (err, UserDetailsResult) {
                                                    if (!err) {
                                                        var procParams = [
                                                            req.db.escape(tokenResult),
                                                            req.db.escape(null),
                                                            req.db.escape(DBSecretKey),
                                                            req.db.escape(isDialer)

                                                        ];
                                                        var procQuery = 'CALL pGetGroupAndIndividuals_new(' + procParams.join(' ,') + ')';
                                                        console.log(procQuery);
                                                        req.db.query(procQuery, function (err, contactResult) {
                                                            if (!err) {
                                                                if (UserDetailsResult[0] && UserDetailsResult[0][0]) {


                                                                    for (var i = 0; i < UserDetailsResult[1].length; i++) {
                                                                        UserDetailsResult[1][i].trackTemplateDetails = UserDetailsResult[1][i] && UserDetailsResult[1][i].trackTemplateDetails ? JSON.parse(UserDetailsResult[1][i].trackTemplateDetails) : [];
                                                                    }
                                                                    console.log('login new token generation', UserDetailsResult[1]);

                                                                    UserDetailsResult[0][0].Picture = (UserDetailsResult[0][0].Picture) ?
                                                                        (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + UserDetailsResult[0][0].Picture) : '';

                                                                    /**
                                                                     * Every time the user loads the website the browser sends the cookie back to the server to notify the user previous activity
                                                                     */
                                                                    res.cookie('Token', tokenResult, {
                                                                        maxAge: 900000,
                                                                        httpOnly: true
                                                                    });
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
                                                                    responseMessage.LastName = loginDetails[0].LastName;
                                                                    if (loginDetails[0].ParentMasterID == 0) {
                                                                        responseMessage.MasterID = loginDetails[0].TID;
                                                                    }
                                                                    else {
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
                                                                    responseMessage.isHelloEZE = loginDetails[0].isHelloEZE;
                                                                    responseMessage.isWMAdmin = loginDetails[0].isWMAdmin;
                                                                    responseMessage.displayName = loginDetails[0].displayName;
                                                                    responseMessage.whatMateCount = loginDetails[0].whatMateCount;
                                                                    responseMessage.isEmployee = loginDetails[0].isEmployee;
                                                                    responseMessage.isNewUser = loginDetails[0].isNewUser;
                                                                    responseMessage.pendingViewCount = loginDetails[0].pendingViewCount;
                                                                    responseMessage.attachmentCount = loginDetails[0].attachmentCount;
                                                                    responseMessage.userDetails = UserDetailsResult[0];
                                                                    if (UserDetailsResult[0] && UserDetailsResult[0][0]) {
                                                                        responseMessage.contactDetails = contactResult[0];
                                                                    }
                                                                    else {
                                                                        responseMessage.contactDetails = null;
                                                                    }
                                                                    responseMessage.companyDetails = UserDetailsResult[1][0] ? UserDetailsResult[1][0] : {};

                                                                    // saving ios device id to database
                                                                    // if (isIphone == 1) {
                                                                    //     var queryParams1 = st.db.escape(ezeoneId) + ',' + st.db.escape(deviceToken);
                                                                    //     var query1 = 'CALL pSaveIPhoneDeviceID(' + queryParams1 + ')';
                                                                    //     //console.log(query);
                                                                    //     st.db.query(query1, function (err, deviceResult) {
                                                                    //         if (!err) {
                                                                    //             console.log('FnLogin:Ios Device Id saved successfully');
                                                                    //         }
                                                                    //         else {
                                                                    //             console.log(err);
                                                                    //         }
                                                                    //     });
                                                                    // }
                                                                    response.status = true;
                                                                    response.message = "Logged in successfully";
                                                                    response.error = null;

                                                                    var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
                                                                    zlib.gzip(buf, function (_, result) {
                                                                        response.data = encryption.encrypt(result, secretKey).toString('base64');
                                                                        res.status(200).json(response);
                                                                    });

                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                            else {

                                                response.status = false;
                                                response.message = "failed to generate a token";
                                                response.error = null;
                                                var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, secretKey).toString('base64');
                                                    res.status(500).json(response);
                                                });

                                                console.log('FnLogin:failed to generate a token ');
                                                console.log('FnLogin:' + err);
                                            }
                                        });
                                    }
                                    else {
                                        response.status = false;
                                        response.message = "Invalid credentials";
                                        response.error = null;
                                        var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
                                        zlib.gzip(buf, function (_, result) {
                                            response.data = encryption.encrypt(result, secretKey).toString('base64');
                                            res.status(200).json(response);
                                        });

                                        console.log('FnLogin:password not matched ');
                                    }
                                }
                                else {

                                    for (var i = 0; i < loginResult[1].length; i++) {
                                        loginResult[1][i].trackTemplateDetails = loginResult[1][i] && loginResult[1][i].trackTemplateDetails ? JSON.parse(loginResult[1][i].trackTemplateDetails) : [];
                                    }
                                    console.log("login company details with existing token", loginResult[1][0]);

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
                                    if (loginDetails[0].ParentMasterID == 0) {
                                        responseMessage.MasterID = loginDetails[0].TID;
                                    }
                                    else {
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
                                    responseMessage.cvid = loginDetails[0].cvid;
                                    responseMessage.profile_status = loginDetails[0].ps;
                                    responseMessage.isHelloEZE = loginDetails[0].isHelloEZE;
                                    responseMessage.isWMAdmin = loginDetails[0].isWMAdmin;
                                    responseMessage.isNewUser = loginDetails[0].isNewUser;
                                    responseMessage.pendingViewCount = loginDetails[0].pendingViewCount;
                                    responseMessage.attachmentCount = loginDetails[0].attachmentCount;
                                    responseMessage.companyDetails = loginResult[1][0] ? loginResult[1][0] : {};


                                    response.status = true;
                                    response.message = "Logged in successfully";
                                    response.error = null;
                                    var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });

                                    // res.send(responseMessage);
                                }
                            }
                            else {
                                response.status = false;
                                response.message = "Invalid credentials";
                                response.error = null;
                                var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, secretKey).toString('base64');
                                    res.status(200).json(response);
                                });

                                console.log('FnLogin:login result not found');
                            }
                        }
                        else {
                            response.status = false;
                            response.message = "Invalid credentials";
                            response.error = null;
                            var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                            console.log('FnLogin:login result not found');
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Invalid credentials";
                        response.error = null;
                        var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                        console.log('FnLogin: Invalid login credentials');
                    }
                }
                else {
                    response.status = false;
                    response.message = "Internal server error..";
                    response.error = null;
                    var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
                    zlib.gzip(buf, function (_, result) {
                        response.data = encryption.encrypt(result, secretKey).toString('base64');
                        res.status(500).json(response);
                    });

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

            response.status = false;
            response.message = "Please fill mandatory fields";
            response.error = null;
            var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
            zlib.gzip(buf, function (_, result) {
                response.data = encryption.encrypt(result, secretKey).toString('base64');
                res.status(400).json(response);
            });

        }



        //close here
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log(ex);
        console.log('FnLogin:: error:' + ex);
        response.message = "Internal server error";
        res.status(500).json(response);
    }
};



/**
 * @todo FnLogin
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Auth.prototype.loginLatest = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    // var ezeoneId = req.st.alterEzeoneId(req.body.UserName);

    // var password = req.body.Password;
    // var isIphone = req.body.device ? parseInt(req.body.device) : 0;
    // var deviceToken = req.body.device_token ? req.body.device_token : '';
    var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var token = req.query.token ? req.query.token : ''; // token in query now
    // var code = req.body.code ? req.st.alterEzeoneId(req.body.code) : '';
    // var isWhatMate = req.body.isWhatMate ? req.body.isWhatMate : 0;
    // var APNS_Id = (req.body.APNS_Id) ? (req.body.APNS_Id) : "";
    // var GCM_Id = (req.body.GCM_Id) ? (req.body.GCM_Id) : "";
    // var secretKey = (req.body.secretKey) ? (req.body.secretKey) : null;
    // console.log("secretKey",secretKey);

    var responseMessage = {
        token: '',
        tId: '',
        isAuthenticate: false,
        ezeoneId: '',
        displayName: '',
        groupId: '',
        pendingViewCount: '',
        attachmentCount: '',
        isNewUser: '',
        brandingPageUrl: '',
        masterId: ''

    };
    // if(isWhatMate == 0){
    //     switch(req.platform){
    //         case 'ios':
    //             /**
    //              * If IOS version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.IOS[0].indexOf(parseInt(req.query.versionCode)) == -1 && req.CONFIG.VERSION_LIST.IOS[1].indexOf(parseInt(req.query.versionCode)) == -1 ){
    //                 responseMessage.versionStatus = 2;
    //                 responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //                 res.send(responseMessage);
    //                 return;
    //             }
    //             else if(req.CONFIG.VERSION_LIST.IOS[1].indexOf(parseInt(req.query.versionCode)) == -1){
    //                 responseMessage.versionStatus = 1;
    //                 responseMessage.versionMessage = "New update available. Please update your application to latest version";
    //                 //res.send(responseMessage);
    //                 //return;
    //             }
    //             else{
    //                 responseMessage.versionStatus = 0;
    //                 responseMessage.versionMessage = "Applications is up to date";
    //                 //res.send(responseMessage);
    //             }
    //             break;
    //         case 'android':
    //             /**
    //              * If Android version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.ANDROID.indexOf(parseInt(req.query.versionCode)) == -1){
    //                 responseMessage.versionStatus = 2;
    //                 responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //                 res.send(responseMessage);
    //                 return;
    //             }
    //             else{
    //                 responseMessage.versionStatus = (req.CONFIG.VERSION_LIST.ANDROID.length ==
    //                 (req.CONFIG.VERSION_LIST.ANDROID.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1;
    //                 responseMessage.versionMessage = (responseMessage.versionStatus)
    //                     ? "New update available. Please update your application to latest version" : responseMessage.versionMessage;
    //
    //             }
    //             break;
    //         case 'web':
    //             /**
    //              * If Web version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) == -1){
    //                 responseMessage.versionStatus = 2;
    //                 responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //                 res.send(responseMessage);
    //                 return;
    //             }
    //             else{
    //                 responseMessage.versionStatus = (req.CONFIG.VERSION_LIST.WEB.length ==
    //                 (req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1;
    //                 responseMessage.versionMessage = (responseMessage.versionStatus)
    //                     ? "New update available. Please update your application to latest version" : responseMessage.versionMessage;
    //             }
    //             break;
    //         default:
    //             responseMessage.versionStatus = 2;
    //             responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //             res.send(responseMessage);
    //             return;
    //             break;
    //     }
    // }
    //  else{
    //     switch(req.platform){
    //         case 'ios':
    //             /**
    //              * If IOS version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.WhatMateIOS[0].indexOf(parseInt(req.query.versionCode)) == -1 && req.CONFIG.VERSION_LIST.WhatMateIOS[1].indexOf(parseInt(req.query.versionCode)) == -1 ){
    //                 responseMessage.versionStatus = 2;
    //                 responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //                 res.send(responseMessage);
    //                 return;
    //             }
    //             else if(req.CONFIG.VERSION_LIST.WhatMateIOS[1].indexOf(parseInt(req.query.versionCode)) == -1){
    //                 responseMessage.versionStatus = 1;
    //                 responseMessage.versionMessage = "New update available. Please update your application to latest version";
    //             }
    //             else{
    //                 responseMessage.versionStatus = 0;
    //                 responseMessage.versionMessage = "Applications is up to date";
    //             }
    //             break;
    //         case 'android':
    //             /**
    //              * If Android version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.WhatMateANDROID.indexOf(parseInt(req.query.versionCode)) == -1){
    //                 responseMessage.versionStatus = 2;
    //                 responseMessage.versionMessage = "Please update your application to latest version to continue using it";
    //                 res.send(responseMessage);
    //                 return;
    //             }
    //             else{
    //                 responseMessage.versionStatus = (req.CONFIG.VERSION_LIST.WhatMateANDROID.length ==
    //                 (req.CONFIG.VERSION_LIST.WhatMateANDROID.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1;
    //                 responseMessage.versionMessage = (responseMessage.versionStatus)
    //                     ? "New update available. Please update your application to latest version" : responseMessage.versionMessage;
    //
    //
    //             }
    //             break;
    //         case 'web':
    //             /**
    //              * If Web version is not supported
    //              */
    //             if(req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) == -1){
    //                 rtnMessage.data = {
    //                     versionStatus : 2,
    //                     versionMessage : "Please update your application to latest version to continue using it"
    //                 };
    //
    //                 res.json(rtnMessage);
    //                 return;
    //             }
    //             else{
    //                 rtnMessage.data = {
    //                     versionStatus : (req.CONFIG.VERSION_LIST.WEB.length ==
    //                     (req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1,
    //                     versionMessage : "New update available. Please update your application to latest version"
    //
    //                 };
    //
    //             }
    //             break;
    //         default:
    //             rtnMessage.data = {
    //                 versionStatus : 2,
    //                 versionMessage : "Please update your application to latest version to continue using it"
    //             };
    //
    //             res.json(rtnMessage);
    //             return;
    //             break;
    //     }
    // }

    try {

        var ezeoneId = req.st.alterEzeoneId(req.body.userName);

        var password = req.body.password;
        var isIphone = req.body.device ? parseInt(req.body.device) : 0;
        var deviceToken = req.body.device_token ? req.body.device_token : '';
        var code = req.body.code ? req.st.alterEzeoneId(req.body.code) : '';
        var isWhatMate = req.body.isWhatMate ? req.body.isWhatMate : 0;
        var apnsId = (req.body.apnsId) ? (req.body.apnsId) : "";
        var gcmId = (req.body.gcmId) ? (req.body.gcmId) : "";
        var secretKey = (req.body.secretKey) ? (req.body.secretKey) : null;
        var isDialer= req.query.isDialer ? req.query.isDialer :0;
        console.log("secretKey", secretKey);

        if (ezeoneId && password) {

            var queryParams = st.db.escape(ezeoneId) + ',' + st.db.escape(code) + ',' + st.db.escape(token) + ',' + st.db.escape(DBSecretKey) + ',' + st.db.escape(isDialer);
            var query = 'CALL PLoginNew(' + queryParams + ')';
            console.log('query', query);
            st.db.query(query, function (err, loginResult) {
                // console.log(loginResult);
                if (!err) {
                    if (loginResult && password) {
                        //console.log('loginDetails',loginDetails);
                        if (loginResult[0]) {
                            if (loginResult[0].length > 0) {
                                var loginDetails = loginResult[0];
                                if (!token) {
                                    if (comparePassword(password, loginDetails[0].Password)) {
                                        st.generateToken(ip, userAgent, loginDetails[0].EZEID, isWhatMate, apnsId, gcmId, secretKey, isDialer, function (err, tokenResult) {
                                            if ((!err) && tokenResult && loginDetails[0]) {

                                                responseMessage.token = tokenResult,
                                                    responseMessage.isAuthenticate = true;
                                                responseMessage.tId = loginDetails[0].TID;
                                                responseMessage.ezeoneId = loginDetails[0].EZEID;
                                                responseMessage.displayName = loginDetails[0].displayName;
                                                // responseMessage.companyName = loginDetails[0].CompanyName;
                                                // responseMessage.Type = loginDetails[0].IDTypeID;
                                                // responseMessage.Verified = loginDetails[0].EZEIDVerifiedID;
                                                // responseMessage.SalesModueTitle = loginDetails[0].SalesModueTitle;
                                                // responseMessage.SalesModuleTitle = loginDetails[0].SalesModuleTitle;
                                                // responseMessage.AppointmentModuleTitle = loginDetails[0].AppointmentModuleTitle;
                                                // responseMessage.HomeDeliveryModuleTitle = loginDetails[0].HomeDeliveryModuleTitle;
                                                // responseMessage.ServiceModuleTitle = loginDetails[0].ServiceModuleTitle;
                                                // responseMessage.CVModuleTitle = loginDetails[0].CVModuleTitle;
                                                // responseMessage.SalesFormMsg = loginDetails[0].SalesFormMsg;
                                                // responseMessage.ReservationFormMsg = loginDetails[0].ReservationFormMsg;
                                                // responseMessage.HomeDeliveryFormMsg = loginDetails[0].HomeDeliveryFormMsg;
                                                // responseMessage.ServiceFormMsg = loginDetails[0].ServiceFormMsg;
                                                // responseMessage.CVFormMsg = loginDetails[0].CVFormMsg;
                                                // responseMessage.SalesItemListType = loginDetails[0].SalesItemListType;
                                                // responseMessage.RefreshInterval = loginDetails[0].RefreshInterval;
                                                // responseMessage.UserModuleRights = loginDetails[0].UserModuleRights;
                                                // responseMessage.LastName = loginDetails[0].LastName;
                                                if (loginDetails[0].ParentMasterID == 0) {
                                                    responseMessage.masterId = loginDetails[0].TID;
                                                }
                                                else {
                                                    responseMessage.masterId = loginDetails[0].ParentMasterID;
                                                }
                                                // responseMessage.PersonalEZEID = loginDetails[0].PersonalEZEID;
                                                // responseMessage.VisibleModules = loginDetails[0].VisibleModules;
                                                // responseMessage.FreshersAccepted = loginDetails[0].FreshersAccepted;
                                                // responseMessage.HomeDeliveryItemListType = loginDetails[0].HomeDeliveryItemListType;
                                                // responseMessage.ReservationDisplayFormat = loginDetails[0].ReservationDisplayFormat;
                                                // responseMessage.mobilenumber = loginDetails[0].mobilenumber;
                                                // responseMessage.isAddressSaved = loginDetails[0].isAddressSaved;
                                                responseMessage.groupId = loginDetails[0].group_id;
                                                // responseMessage.isinstitute_admin = loginDetails[0].isinstituteadmin;
                                                // responseMessage.cvid = loginDetails[0].cvid;
                                                // responseMessage.profile_status = loginDetails[0].ps;
                                                // responseMessage.isHelloEZE = loginDetails[0].isHelloEZE;
                                                // responseMessage.isWMAdmin = loginDetails[0].isWMAdmin;
                                                // responseMessage.displayName = loginDetails[0].displayName;
                                                // responseMessage.whatMateCount = loginDetails[0].whatMateCount;
                                                // responseMessage.isEmployee = loginDetails[0].isEmployee;
                                                responseMessage.isNewUser = loginDetails[0].isNewUser;
                                                responseMessage.pendingViewCount = loginDetails[0].pendingViewCount;
                                                responseMessage.attachmentCount = loginDetails[0].attachmentCount;
                                                // responseMessage.userDetails = UserDetailsResult[0];
                                                // if (UserDetailsResult[0] && UserDetailsResult[0][0]) {
                                                //     responseMessage.contactDetails = contactResult[0];
                                                // }
                                                // else {
                                                //     responseMessage.contactDetails = null;
                                                // }
                                                responseMessage.brandingPageUrl = loginDetails[0].brandingPageUrl;

                                                // saving ios device id to database
                                                // if (isIphone == 1) {
                                                //     var queryParams1 = st.db.escape(ezeoneId) + ',' + st.db.escape(deviceToken);
                                                //     var query1 = 'CALL pSaveIPhoneDeviceID(' + queryParams1 + ')';
                                                //     //console.log(query);
                                                //     st.db.query(query1, function (err, deviceResult) {
                                                //         if (!err) {
                                                //             console.log('FnLogin:Ios Device Id saved successfully');
                                                //         }
                                                //         else {
                                                //             console.log(err);
                                                //         }
                                                //     });
                                                // }

                                                response.status = true;
                                                response.message = "Logged in successfully";
                                                response.error = null;
                                                // response.data=(responseMessage);

                                                var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, secretKey).toString('base64');
                                                    res.status(200).json(response);
                                                });

                                            }

                                            else {

                                                response.status = false;
                                                response.message = "failed to generate a token";
                                                response.error = null;
                                                var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, secretKey).toString('base64');
                                                    res.status(500).json(response);
                                                });

                                                console.log('FnLogin:failed to generate a token ');
                                                console.log('FnLogin:' + err);
                                            }
                                        });
                                    }
                                    else {
                                        response.status = false;
                                        response.message = "Invalid credentials";
                                        response.error = null;
                                        var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
                                        zlib.gzip(buf, function (_, result) {
                                            response.data = encryption.encrypt(result, secretKey).toString('base64');
                                            res.status(200).json(response);
                                        });

                                        console.log('FnLogin:password not matched ');
                                    }
                                }
                                else {

                                    for (var i = 0; i < loginResult[1].length; i++) {
                                        loginResult[1][i].trackTemplateDetails = loginResult[1][i] && loginResult[1][i].trackTemplateDetails ? JSON.parse(loginResult[1][i].trackTemplateDetails) : [];
                                    }
                                    console.log("login company details with existing token", loginResult[1][0]);

                                    responseMessage.token = tokenResult;
                                    responseMessage.isAuthenticate = true;
                                    responseMessage.tId = loginDetails[0].TID;
                                    responseMessage.ezeoneId = loginDetails[0].EZEID;
                                    responseMessage.displayName = loginDetails[0].displayName;
                                    // responseMessage.companyName = loginDetails[0].CompanyName;
                                    // responseMessage.Type = loginDetails[0].IDTypeID;
                                    // responseMessage.Verified = loginDetails[0].EZEIDVerifiedID;
                                    // responseMessage.SalesModueTitle = loginDetails[0].SalesModueTitle;
                                    // responseMessage.SalesModuleTitle = loginDetails[0].SalesModuleTitle;
                                    // responseMessage.AppointmentModuleTitle = loginDetails[0].AppointmentModuleTitle;
                                    // responseMessage.HomeDeliveryModuleTitle = loginDetails[0].HomeDeliveryModuleTitle;
                                    // responseMessage.ServiceModuleTitle = loginDetails[0].ServiceModuleTitle;
                                    // responseMessage.CVModuleTitle = loginDetails[0].CVModuleTitle;
                                    // responseMessage.SalesFormMsg = loginDetails[0].SalesFormMsg;
                                    // responseMessage.ReservationFormMsg = loginDetails[0].ReservationFormMsg;
                                    // responseMessage.HomeDeliveryFormMsg = loginDetails[0].HomeDeliveryFormMsg;
                                    // responseMessage.ServiceFormMsg = loginDetails[0].ServiceFormMsg;
                                    // responseMessage.CVFormMsg = loginDetails[0].CVFormMsg;
                                    // responseMessage.SalesItemListType = loginDetails[0].SalesItemListType;
                                    // responseMessage.RefreshInterval = loginDetails[0].RefreshInterval;
                                    // responseMessage.UserModuleRights = loginDetails[0].UserModuleRights;
                                    // responseMessage.LastName = loginDetails[0].LastName;
                                    if (loginDetails[0].ParentMasterID == 0) {
                                        responseMessage.masterId = loginDetails[0].TID;
                                    }
                                    else {
                                        responseMessage.masterId = loginDetails[0].ParentMasterID;
                                    }
                                    // responseMessage.PersonalEZEID = loginDetails[0].PersonalEZEID;
                                    // responseMessage.VisibleModules = loginDetails[0].VisibleModules;
                                    // responseMessage.FreshersAccepted = loginDetails[0].FreshersAccepted;
                                    // responseMessage.HomeDeliveryItemListType = loginDetails[0].HomeDeliveryItemListType;
                                    // responseMessage.ReservationDisplayFormat = loginDetails[0].ReservationDisplayFormat;
                                    // responseMessage.mobilenumber = loginDetails[0].mobilenumber;
                                    // responseMessage.isAddressSaved = loginDetails[0].isAddressSaved;
                                    responseMessage.groupId = loginDetails[0].group_id;
                                    // responseMessage.isinstitute_admin = loginDetails[0].isinstituteadmin;
                                    // responseMessage.cvid = loginDetails[0].cvid;
                                    // responseMessage.profile_status = loginDetails[0].ps;
                                    // responseMessage.isHelloEZE = loginDetails[0].isHelloEZE;
                                    // responseMessage.isWMAdmin = loginDetails[0].isWMAdmin;
                                    // responseMessage.displayName = loginDetails[0].displayName;
                                    // responseMessage.whatMateCount = loginDetails[0].whatMateCount;
                                    // responseMessage.isEmployee = loginDetails[0].isEmployee;
                                    responseMessage.isNewUser = loginDetails[0].isNewUser;
                                    responseMessage.pendingViewCount = loginDetails[0].pendingViewCount;
                                    responseMessage.attachmentCount = loginDetails[0].attachmentCount;
                                    // responseMessage.userDetails = UserDetailsResult[0];
                                    // if (UserDetailsResult[0] && UserDetailsResult[0][0]) {
                                    //     responseMessage.contactDetails = contactResult[0];
                                    // }
                                    // else {
                                    //     responseMessage.contactDetails = null;
                                    // }
                                    responseMessage.brandingPageUrl = loginDetails[0].brandingPageUrl;

                                    response.status = true;
                                    response.message = "Logged in successfully";
                                    response.error = null;
                                    var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });

                                    // res.send(responseMessage);
                                }
                            }
                            else {
                                response.status = false;
                                response.message = "Invalid credentials";
                                response.error = null;
                                var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, secretKey).toString('base64');
                                    res.status(200).json(response);
                                });

                                console.log('FnLogin:login result not found');
                            }
                        }
                        else {
                            response.status = false;
                            response.message = "Invalid credentials";
                            response.error = null;
                            var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                            console.log('FnLogin:login result not found');
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Invalid credentials";
                        response.error = null;
                        var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                        console.log('FnLogin: Invalid login credentials');
                    }
                }
                else {
                    response.status = false;
                    response.message = "Internal server error..";
                    response.error = null;
                    var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
                    zlib.gzip(buf, function (_, result) {
                        response.data = encryption.encrypt(result, secretKey).toString('base64');
                        res.status(500).json(response);
                    });

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

            response.status = false;
            response.message = "Please fill mandatory fields";
            response.error = null;
            var buf = new Buffer(JSON.stringify(responseMessage), 'utf-8');
            zlib.gzip(buf, function (_, result) {
                response.data = encryption.encrypt(result, secretKey).toString('base64');
                res.status(400).json(response);
            });

        }



        //close here
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log(ex);
        console.log('FnLogin:: error:' + ex);
        response.message = "Internal server error";
        res.status(500).json(response);
    }
};


/**
 * @todo FnLogin
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Auth.prototype.portalLogin = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

    var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var token = req.query.token ? req.query.token : ''; // token in query now

    try {

        var ezeoneId = req.st.alterEzeoneId(req.body.userName);

        var password = req.body.password;
        var isIphone = req.body.device ? parseInt(req.body.device) : 0;
        var deviceToken = req.body.device_token ? req.body.device_token : '';
        var code = req.body.code ? req.st.alterEzeoneId(req.body.code) : '';
        var isWhatMate = req.body.isWhatMate ? req.body.isWhatMate : 0;
        var apnsId = (req.body.apnsId) ? (req.body.apnsId) : "";
        var gcmId = (req.body.gcmId) ? (req.body.gcmId) : "";
        var secretKey = (req.body.secretKey) ? (req.body.secretKey) : null;
        console.log("secretKey", secretKey);

        if (ezeoneId && password) {

            var queryParams = st.db.escape(ezeoneId) + ',' + st.db.escape(DBSecretKey);
            var query = 'CALL wm_portal_login(' + queryParams + ')';
            console.log('query', query);
            st.db.query(query, function (err, loginResult) {
                // console.log(loginResult);
                if (!err) {
                    if (loginResult && password) {

                        if (loginResult[0]) {
                            if (loginResult[0].length > 0) {
                                var loginDetails = loginResult[0];
                                if (!token) {
                                    if(loginDetails[0].message){
                                        response.status = false;
                                        response.message = loginDetails[0].message;
                                        response.error = null;
                                        response.data =null;
                                        res.status(200).json(response);
                                    }
                                    else{

                                        if (comparePassword(password, loginDetails[0].Password)) {
                                            st.generateToken(ip, userAgent, loginDetails[0].ezeid, isWhatMate, apnsId, gcmId, secretKey, function (err, tokenResult) {
                                                if ((!err) && tokenResult && loginDetails[0].userMasterId) {
    
                                                    response.status = true;
                                                    response.message = "Logged in successfully";
                                                    response.error = null;
    
                                                    response.data = {
                                                        token: tokenResult,
                                                        isAuthenticate: true,
                                                        userMasterId: loginDetails[0].userMasterId,
                                                        ezeoneId: loginDetails[0].ezeid,
                                                        displayName: loginDetails[0].displayName,
                                                        groupId: loginDetails[0].groupId,
                                                        applicantId : loginDetails[0].applicantId,
                                                        imageUrl : loginDetails[0].imageUrl

                                                    }
                                                    res.status(200).json(response);
    
                                                }
    
                                                else {
                                                    response.status = false;
                                                    response.message = "failed to generate a token";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
    
                                                    console.log('FnLogin:failed to generate a token ');
                                                    console.log('FnLogin:' + err);
                                                }
                                            });
                                        }
                                        else {
                                            response.status = false;
                                            response.message = "Invalid credentials";
                                            response.error = null;
                                            response.data = null;
                                            res.status(500).json(response);
    
                                            console.log('FnLogin:password not matched ');
                                        }
                                    }
                                    
                                }
                                else {


                                    response.status = true;
                                    response.message = "Logged in successfully";
                                    response.error = null;

                                    response.data = {
                                        token: tokenResult,
                                        isAuthenticate: true,
                                        userMasterId: loginDetails[0].userMasterId,
                                        ezeoneId: loginDetails[0].ezeid,
                                        displayName: loginDetails[0].displayName,
                                        groupId: loginDetails[0].groupId,
                                        applicantId : loginDetails[0].applicantId

                                    }
                                    res.status(200).json(response);
                                }
                            }
                            else {
                                response.status = false;
                                response.message = "Invalid credentials";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);

                                console.log('FnLogin:login result not found');
                            }
                        }
                        else {
                            response.status = false;
                            response.message = "Invalid credentials";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                            console.log('FnLogin:login result not found');
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Invalid credentials";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);

                        console.log('FnLogin: Invalid login credentials');
                    }
                }
                else {
                    response.status = false;
                    response.message = "Invalid credentials";
                    response.error = null;
                    response.data=null;
                    res.status(500).json(response);

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

            response.status = false;
            response.message = "Please fill mandatory fields";
            response.error = null;
            res.status(400).json(response);
        }

    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log(ex);
        console.log('FnLogin:: error:' + ex);
        response.message = "Internal server error";
        res.status(500).json(response);
    }
};


Auth.prototype.pacehcmLogin = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    
    var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var token = req.query.token ? req.query.token : ''; // token in query now
    

    var responseMessage = {
        token: '',
        tId: '',
        isAuthenticate: false,
        ezeoneId: '',
        displayName: '',
        groupId: '',
        pendingViewCount: '',
        attachmentCount: '',
        isNewUser: '',
        brandingPageUrl: '',
        masterId: ''

    };

    try {

        var ezeoneId = req.st.alterEzeoneId(req.body.userName);

        var password = req.body.password;
        var isIphone = req.body.device ? parseInt(req.body.device) : 0;
        var deviceToken = req.body.device_token ? req.body.device_token : '';
        var code = req.body.code ? req.st.alterEzeoneId(req.body.code) : '';
        var isWhatMate = req.body.isWhatMate ? req.body.isWhatMate : 0;
        var apnsId = (req.body.apnsId) ? (req.body.apnsId) : "";
        var gcmId = (req.body.gcmId) ? (req.body.gcmId) : "";
        var secretKey = (req.body.secretKey) ? (req.body.secretKey) : null;
        var isDialer= req.query.isDialer ? req.query.isDialer :0;
        console.log("secretKey", secretKey);

        if (ezeoneId && password) {

            var queryParams = st.db.escape(ezeoneId) + ',' + st.db.escape(code) + ',' + st.db.escape(token) + ',' + st.db.escape(DBSecretKey) + ',' + st.db.escape(isDialer);
            var query = 'CALL PLoginNewPace(' + queryParams + ')';
            console.log('query', query);
            st.db.query(query, function (err, loginResult) {
                // console.log(loginResult);
                if (!err) {
                    if (loginResult && password) {
                        //console.log('loginDetails',loginDetails);
                        if (loginResult[0]) {
                            if (loginResult[0].length > 0) {
                                var loginDetails = loginResult[0];
                                if (!token) {
                                    if (comparePassword(password, loginDetails[0].Password)) {
                                        st.generateToken(ip, userAgent, loginDetails[0].EZEID, isWhatMate, apnsId, gcmId, secretKey, isDialer, function (err, tokenResult) {
                                            if ((!err) && tokenResult && loginDetails[0]) {

                                                responseMessage.token = tokenResult,
                                                    responseMessage.isAuthenticate = true;
                                                responseMessage.tId = loginDetails[0].TID;
                                                responseMessage.ezeoneId = loginDetails[0].EZEID;
                                                responseMessage.displayName = loginDetails[0].displayName;
                                              
                                                if (loginDetails[0].ParentMasterID == 0) {
                                                    responseMessage.masterId = loginDetails[0].TID;
                                                }
                                                else {
                                                    responseMessage.masterId = loginDetails[0].ParentMasterID;
                                                }
                                                responseMessage.groupId = loginDetails[0].group_id;
                                                responseMessage.isNewUser = loginDetails[0].isNewUser;
                                                responseMessage.pendingViewCount = loginDetails[0].pendingViewCount;
                                                responseMessage.attachmentCount = loginDetails[0].attachmentCount;
                                                responseMessage.brandingPageUrl = loginDetails[0].brandingPageUrl;

                                                response.status = true;
                                                response.message = "Logged in successfully";
                                                response.error = null;
                                                response.data = responseMessage;
                                                res.status(200).json(response);

                                            }

                                            else {

                                                response.status = false;
                                                response.message = "failed to generate a token";
                                                response.error = null;
                                                response.data = responseMessage;
                                                res.status(500).json(response);

                                                console.log('FnLogin:failed to generate a token ');
                                                console.log('FnLogin:' + err);
                                            }
                                        });
                                    }
                                    else {
                                        response.status = false;
                                        response.message = "Invalid credentials";
                                        response.error = null;
                                        response.data = responseMessage;
                                        res.status(200).json(response);
                                        console.log('FnLogin:password not matched ');
                                    }
                                }
                                else {

                                    for (var i = 0; i < loginResult[1].length; i++) {
                                        loginResult[1][i].trackTemplateDetails = loginResult[1][i] && loginResult[1][i].trackTemplateDetails ? JSON.parse(loginResult[1][i].trackTemplateDetails) : [];
                                    }
                                    console.log("login company details with existing token", loginResult[1][0]);

                                    responseMessage.token = tokenResult;
                                    responseMessage.isAuthenticate = true;
                                    responseMessage.tId = loginDetails[0].TID;
                                    responseMessage.ezeoneId = loginDetails[0].EZEID;
                                    responseMessage.displayName = loginDetails[0].displayName;
                                    if (loginDetails[0].ParentMasterID == 0) {
                                        responseMessage.masterId = loginDetails[0].TID;
                                    }
                                    else {
                                        responseMessage.masterId = loginDetails[0].ParentMasterID;
                                    }
                                    responseMessage.groupId = loginDetails[0].group_id;
                                    responseMessage.isNewUser = loginDetails[0].isNewUser;
                                    responseMessage.pendingViewCount = loginDetails[0].pendingViewCount;
                                    responseMessage.attachmentCount = loginDetails[0].attachmentCount;
                                    responseMessage.brandingPageUrl = loginDetails[0].brandingPageUrl;

                                    response.status = true;
                                    response.message = "Logged in successfully";
                                    response.error = null;
                                    response.data = responseMessage;
                                    res.status(200).json(response);

                                }
                            }
                            else {
                                response.status = false;
                                response.message = "Invalid credentials";
                                response.error = null;
                                response.data =responseMessage;
                                res.status(200).json(response);
                                console.log('FnLogin:login result not found');
                            }
                        }
                        else {
                            response.status = false;
                            response.message = "Invalid credentials";
                            response.error = null;
                            response.data = responseMessage;
                            res.status(200).json(response);

                            console.log('FnLogin:login result not found');
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Invalid credentials";
                        response.error = null;
                            response.data = responseMessage;
                            res.status(200).json(response);

                        console.log('FnLogin: Invalid login credentials');
                    }
                }
                else {
                    response.status = false;
                    response.message = "Internal server error..";
                    response.error = null;
                    response.data = responseMessage;
                    res.status(500).json(response);
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

            response.status = false;
            response.message = "Please fill mandatory fields";
            response.error = null;
            response.data = responseMessage;
            res.status(400).json(response);

        }

        //close here
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log(ex);
        console.log('FnLogin:: error:' + ex);
        response.message = "Internal server error";
        res.status(500).json(response);
    }
};


module.exports = Auth;
