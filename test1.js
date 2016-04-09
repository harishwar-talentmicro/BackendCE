/**
 * Created by Hirecraft on 07-04-2016.
 */
var express = require('express');
var router = express.Router();
var util = require('util');
var validator = require('validator');
var Mailer = require('./mail/mailer.js');
var mailerApi = new Mailer();
//var user.testName = "bhavya";
//var lastName = "jain";
//var ezeArray = ['bhavya1','bhavya2','bhavya3','bhavya4','bhavya5',"abhishek","anjali"];
//var temp='';
//
//    for(var j=0;j<ezeArray.length+1;j++){
//        var i = j+1;
//        temp = user.testName+i;
//        if(temp != ezeArray[j]){
//            break;
//        }
//}
//
var chalk = require("chalk");

router.post('/',function(req,res,next){
    var operationType = parseInt(req.body.OperationType) ? req.body.OperationType : 0;
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


    var i=0;
    var count = 0;
    var ezeName = function(user,callback){


        var query = "SELECT tid FROM tmaster WHERE ezeid = " + db.escape(user.testName.toLowerCase()+(i+1));

        db.query(query,function(err,results){
            if(!err){
                if(results && results[0] && results[0][0]){
                    if(count > 99 && user.lastName){
                        i = 0;
                        user.testName += user.lastName.substr(0,1);
                        if(count > 199 &&  user.lastName.length > 1){
                            user.testName += user.lastName.substr(0,2);
                        }
                    }
                    i += 1;
                    count += 1;
                    ezeName(user);
                }
                else{
                    chalk.green(console.log("Available EZEOne : ",user.testName.toLowerCase()+(i+1)));
                    user.ezeoneId = user.testName.toLowerCase()+(i+1);
                    callback(user);
                }
            }
            else{

            }
        });


        /**
         *
         */
        //if(ezeArray.indexOf(user.testName+(i+1)) == -1){
        //    chalk.green(console.log("Available EZEOne : ",user.testName+(i+1)));
        //    return;
        //}
        //else{
        //    i += 1;
        //    ezeName(user.testName);
        //}
    };

    var userObj = {
        firstName : firstName,
        lastName : lastName,
        email : email,
        phone : mobileNumber
    };
    userObj.testName = userObj.firstName;
    ezeName(userObj,function(availableEzeid){
        /**
         * @TODO
         * Call procedure to register this ezeid and trigger a mail for that person
         */

    });
    console.log(temp,"temp");

});

module.exports = router;