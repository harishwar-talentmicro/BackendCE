/**
 * Created by Hirecraft on 05-07-2016.
 */
var request = require('request');
var RegisterCtrl = {};

RegisterCtrl.register = function(req,res,next){

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");


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
        profile_status:'',
        businesssize:'',
        headcount:'',
        branch:'',
        ismnc:'',
        versionStatus : 0,
        versionMessage : "No update required for this application",
        IsIdAvailable : 1,
        availabilityMessage : "EZEOne ID is available"
    };

    var moment = require('moment');

    //var operationType = parseInt(req.body.OperationType) ? req.body.OperationType : 0;
    var ipAddress = req.ip;
    var selectionType = (!isNaN(parseInt(req.body.SelectionType))) ?  parseInt(req.body.SelectionType) : 0;
    var idtypeId = parseInt(req.body.IDTypeID);

    var ezeid = req.body.EZEID ? (req.st.alterEzeoneId(req.body.EZEID).toUpperCase()):'';
    var password = req.body.Password;
    var firstName = req.body.FirstName ? req.body.FirstName : '';
    var lastName = req.body.LastName ? req.body.LastName : '';
    var companyName = req.body.CompanyName ? req.body.CompanyName : '';
    var jobTitle = req.body.JobTitle ? req.body.JobTitle : '';
    var categoryId = (!isNaN(parseInt(req.body.CategoryID))) ?  parseInt(req.body.CategoryID) : 0;
    var functionId = (!isNaN(parseInt(req.body.FunctionID))) ?  parseInt(req.body.FunctionID) : 0;
    var roleId = (!isNaN(parseInt(req.body.RoleID))) ?  parseInt(req.body.RoleID) : 0;
    var languageId = (!isNaN(parseInt(req.body.LanguageID))) ?  parseInt(req.body.LanguageID) : 0;
    var nameTitleId = (req.body.NameTitleID) ? req.body.NameTitleID : 0;
    var latitude = req.body.Latitude ? req.body.Latitude : 0.00;
    var longitude = req.body.Longitude ? req.body.Longitude : 0.00;
    var altitude = req.body.Altitude ? req.body.Altitude : 0.00;
    var addressLine1 = (req.body.AddressLine1) ? req.body.AddressLine1 : '' ;
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

    var isdPhoneNumber =  req.body.ISDPhoneNumber ? req.body.ISDPhoneNumber : '';
    var isdMobileNumber = req.body.ISDMobileNumber ? req.body.ISDMobileNumber : '';
    var parkingStatus = req.body.ParkingStatus ? req.body.ParkingStatus : 0;
    var gender = (!isNaN(parseInt(req.body.Gender))) ?  parseInt(req.body.Gender) : 2;
    var dob = (req.body.DOB) ? (req.body.DOB) : '';
    if(idtypeId != 1){
        dob = moment().format('YYYY-MM-DD');
    }

    console.log(dob);

    var momentObj = moment(dob,'YYYY-MM-DD').isValid();
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
    var businesssize = (req.body.businesssize) ? req.body.businesssize : 0;
    var headcount = (req.body.headcount) ? req.body.headcount : 0;
    var branch = (req.body.branch) ? req.body.branch : 0;
    var ismnc = (req.body.ismnc) ? req.body.ismnc : 0;
    var rating = (req.body.rating) ? req.body.rating : 1;
    var holidayList = (req.body.holidayList) ? req.body.holidayList : [];
    var workingHourList = (req.body.workingHourList) ? req.body.workingHourList : [];
    var APNS_Id = (req.body.APNS_Id) ? (req.body.APNS_Id) : "";
    var GCM_Id = (req.body.GCM_Id) ? (req.body.GCM_Id) : "";


    var validateStatus = true;
    var error = {};

    if(idtypeId == 1) {
        if (!firstName) {
            error['firstName'] = 'firstName is mandatory';
            validateStatus *= false;
            console.log('firstName is mandatory');
        }
    }
    if(idtypeId == 2 && idtypeId == 3 && idtypeId == 4){
        error['companyName'] = 'companyName is mandatory';
        validateStatus *= false;
        console.log('companyName is mandatory');
    }

    if(momentObj){
        dob = moment(dob).format('YYYY-MM-DD HH:mm:ss');
    }

    else {
        error['dob'] = 'dob date is wrong format';
        validateStatus *= false;
        console.log('dob date is wrong format');
    }

    if(!validateStatus){
        rtnMessage.error = error;
        res.status(400).json(rtnMessage);

    }
    else {
        try {
            var list = req.CONFIG.RESERVED_EZEONE_LIST;
            var testCase = ezeid.replace('@','');
            var allowedFlag = true;

            for(var i = 0; i < list.length; i++){
                var reg = new RegExp(list[i],'g');
                if(reg.test(testCase)){
                    //console.log('Test pass : Should not be allowed',testCase);
                    allowedFlag = false;
                    break;
                }
            }

            var savePrimaryData = function(){
                if(allowedFlag){
                    /**
                     * Register
                     */
                    encryptPwd = (password) ? req.st.hashPassword(password) : req.st.hashPassword('123456');
                    var isWhatMate = req.body.isWhatMate ? req.body.isWhatMate : 0;

                    var queryParams = req.st.db.escape(idtypeId) + ',' + req.st.db.escape(ezeid) + ',' + req.st.db.escape(encryptPwd)
                        + ',' + req.st.db.escape(firstName) + ',' + req.st.db.escape(lastName) + ',' + req.st.db.escape(companyName)
                        + ',' + req.st.db.escape(jobTitle) + ',' + req.st.db.escape(functionId) + ',' + req.st.db.escape(roleId)
                        + ',' + req.st.db.escape(languageId) + ',' + req.st.db.escape(nameTitleId) + ',' + req.st.db.escape(token)
                        + ',' + req.st.db.escape(latitude) + ',' + req.st.db.escape(longitude) + ',' + req.st.db.escape(altitude)
                        + ',' + req.st.db.escape(addressLine1) + ',' + req.st.db.escape(addressLine2) + ',' + req.st.db.escape(cityTitle)
                        + ',' + req.st.db.escape(stateId) + ',' + req.st.db.escape(countryId) + ',' + req.st.db.escape(postalCode)
                        + ',' + req.st.db.escape(pin) + ',' + req.st.db.escape(phoneNumber) + ',' + req.st.db.escape(mobileNumber)
                        + ',' + req.st.db.escape(email) + ',' + req.st.db.escape(picture) + ',' + req.st.db.escape(pictureFileName)
                        + ',' + req.st.db.escape(webSite) + ',' + req.st.db.escape(operation) + ',' + req.st.db.escape(aboutCompany)
                        + ',' + req.st.db.escape(statusId) + ',' + req.st.db.escape(isdPhoneNumber) + ',' + req.st.db.escape(isdMobileNumber)
                        + ',' + req.st.db.escape(gender) + ',' + req.st.db.escape(dob) + ',' + req.st.db.escape(ipAddress)
                        + ',' + req.st.db.escape(selectionType) + ',' + req.st.db.escape(parkingStatus) + ',' + req.st.db.escape(templateId)
                        + ',' + req.st.db.escape(categoryId) + ',' + req.st.db.escape(visibleEmail) + ',' + req.st.db.escape(visibleMobile)
                        + ',' + req.st.db.escape(visiblePhone) + ',' + req.st.db.escape(locTitle) + ',' + req.st.db.escape(visibleAddress)
                        + ',' + req.st.db.escape(statusId) + ',' + req.st.db.escape(apUserid) + ',' + req.st.db.escape(businessKeywords)
                        + ',' + req.st.db.escape(companyDetails)+ ',' + req.st.db.escape(businesssize)+ ',' + req.st.db.escape(headcount)
                        + ',' + req.st.db.escape(branch)+ ',' + req.st.db.escape(ismnc)+ ',' + req.st.db.escape(rating);

                    var query = 'CALL pSaveEZEIDData(' + queryParams + ')';
                    console.log(query);
                    req.db.query(query, function (err, registerResult) {

                        if ((!err) && registerResult && registerResult[0] && registerResult[0][0] && registerResult[0][0].TID) {
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

                            console.log('FnRegistration:tmaster: Registration success');

                            var queryParams1 = req.st.db.escape(pin) + ',' + req.st.db.escape(ezeid)
                                + ',' + req.st.db.escape('')+ ',' + req.st.db.escape(addressLine1);
                            var query1 = 'CALL pupdateEZEoneKeywords(' + queryParams1 + ')';

                            var ip = req.headers['x-forwarded-for'] ||
                                req.connection.remoteAddress ||
                                req.socket.remoteAddress ||
                                req.connection.socket.remoteAddress;
                            var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';

                            req.st.generateToken(ip, userAgent, ezeid,isWhatMate,APNS_Id,GCM_Id, function (err, token) {
                                if (err) {
                                    console.log('FnRegistration: Token Generation Error');
                                    console.log(err);
                                }
                                else {
                                    console.log(token);
                                    rtnMessage.Token = token;

                                    /**
                                     * Now update the keywords and then send the response
                                     */

                                    req.db.query(query1, function (err, updateResult) {
                                        if (!err) {
                                            console.log('FnUpdateEZEoneKeywords: Keywords Updated successfully');
                                            /**
                                             * to save working hour at the time of registration calling api usig request
                                             */
                                            request({
                                                    method: 'POST',
                                                    uri: req.CONFIG.CONSTANT.API_URL + 'v1.1/area_partner/listing/schedule/working_hours?token='+req.query.token+'&masterId='+registerResult[0][0].TID,
                                                    json : workingHourList
                                                },
                                                function (error, response, body) {
                                                    if (!error) {
                                                        if (holidayList.length){
                                                            /**
                                                             * to save holiday list at the time of registration calling api usig request
                                                             * if holiday list will come
                                                             */
                                                            request({
                                                                    method: 'POST',
                                                                    uri: req.CONFIG.CONSTANT.API_URL +'v1.1/area_partner/listing/schedule/holiday_list?token='+req.query.token+'&masterId='+registerResult[0][0].TID,
                                                                    json : holidayList
                                                                },
                                                                function (error, response, body) {
                                                                    if (!error) {

                                                                        console.log('Upload successful!  Server responded with:', body);

                                                                        res.send(rtnMessage);
                                                                    }
                                                                    else{
                                                                        return console.error('upload failed:', error);
                                                                        res.send(rtnMessage);
                                                                    }
                                                                });

                                                        }
                                                        else {
                                                            console.log('Upload successful!  Server responded with:', body);
                                                            res.send(rtnMessage);
                                                        }
                                                    }
                                                    else{
                                                        return console.error('upload failed:', error);
                                                        res.send(rtnMessage);
                                                    }
                                                });

                                        }
                                        else {
                                            res.send(rtnMessage);
                                            console.log('FnUpdateEZEoneKeywords: Keywords not updated');
                                            console.log(err);
                                        }
                                    });

                                }
                            });

                        }
                        else {
                            //console.log(rtnMessage);
                            res.send(rtnMessage);
                            console.log('FnRegistration:tmaster: Registration Failed..4');
                        }
                    });

                }
                else{
                    /**
                     * If allowed flag is false then don't register this EZEOne and don't show availability also
                     */
                    res.send(rtnMessage);
                    console.log('FnRegistration:tmaster: ezeid not available');
                }
            };

            var Query = 'Select EZEID from tmaster where EZEID=' + req.st.db.escape(ezeid);
            req.db.query(Query, function (err, EzeidExitsResult) {
                console.log(EzeidExitsResult,"EzeidExitsResult");
                if (!err) {
                    if(EzeidExitsResult && EzeidExitsResult.length > 0) {
                        rtnMessage.IsIdAvailable = 0;
                        rtnMessage.availabilityMessage = "This EZEOne ID is no longer available,Please choose another EZEOne ID";
                        res.send(rtnMessage);
                        console.log('FnCheckEzeid: tmaster: EzeId exists');
                    }
                    else {
                        savePrimaryData();
                    }
                }
                else {
                    res.statusCode = 500;
                    res.send(rtnMessage);
                    console.log('FnCheckEzeid: tmaster: ' + err);
                }
            });
        }
        catch (ex) {
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            console.log('FnRegistration error:' + ex);
            //throw new Error(ex);
        }
    }
};

module.exports = RegisterCtrl;