/**
 *  @author Bhavya  Jain
 *  @since Feb 06,2016  10:46AM
 *  @title Procurement module
 *  @description Handles procurement  functions
 */
"use strict";
var util = require('util');
var validator = require('validator');
var moment = require('moment');
var Mailer = require('../../mail/mailer.js');
var mailerApi = new Mailer();
var Notification = require('./notification/notification-master.js');
var notification = null;
var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
var fs = require('fs');
var chalk = require('chalk');
var st = null;
//var _ = require('underscore');
var CONFIG = require('../../ezeone-config.json');
function Procurement(db,stdLib){

    if(stdLib){
        st = stdLib;
        notification = new Notification(db,stdLib);
    }

};

/**
 *
 * @param token
 * @param toEZEID
 * @param functionType
 * @param folderRuleID
 *
 * @discription send notification for new sales enquity to all subusers
 */

var sendNotiToSubuser = function(token,toEZEID,functionType,folderRuleID){
    /**
     * We are getting ezeid then compairing EZEID with TOEZEID
     * if EZEID's are not same then only notifications will be sent.
     */

    var notiQueryParam = st.db.escape(token);
    var notiQuery = 'CALL get_user_ezeid(' + notiQueryParam + ')';
    console.log(notiQuery);
    st.db.query(notiQuery, function (err, userDetailsRes) {
        console.log(userDetailsRes);
        if (userDetailsRes) {
            if (userDetailsRes[0]) {
                if (userDetailsRes[0][0]){
                    if (userDetailsRes[0][0].EZEID){
                        var eqCreationMasterEzeid = (userDetailsRes[0][0].EZEID) ? userDetailsRes[0][0].EZEID.split('.')[0] : '';
                        if (eqCreationMasterEzeid != toEZEID){
                            /**
                             * From bellow procedure we are getting list of all subusers of ToEZEID after then checking for
                             * user access, and then folder rights if all conditions will match then only notification
                             * will be sent
                             */
                            var notificationQueryParams = st.db.escape(toEZEID) + ',' + st.db.escape(functionType);
                            var notificationQuery = 'CALL get_subuser_list(' + notificationQueryParams + ')';
                            console.log(notificationQuery);
                            st.db.query(notificationQuery, function (err, notDetailsRes) {
                                console.log(notDetailsRes);
                                if (notDetailsRes) {
                                    if (notDetailsRes[0]){
                                        for (var count = 0; count < notDetailsRes[0].length; count++) {
                                            if (notDetailsRes[0][count].userRights){
                                                if ((!isNaN(parseInt(notDetailsRes[0][count].userRights.split()[0]))) &&
                                                    parseInt(notDetailsRes[0][count].userRights.split()[0]) > 0 ){

                                                    var foldRIDSubuser = notDetailsRes[0][count].rid.split(',');
                                                    console.log(foldRIDSubuser);
                                                    /**
                                                     * to match string with string
                                                     */
                                                    if (foldRIDSubuser.indexOf((folderRuleID) ? folderRuleID.toString() : null ) != -1){
                                                        var receiverId = notDetailsRes[0][count].receiverId;
                                                        var senderTitle = userDetailsRes[0][0].EZEID;
                                                        var groupTitle = notDetailsRes[0][count].groupTitle;
                                                        var groupId = notDetailsRes[0][count].groupId;
                                                        var messageText = 'You have received a lead.';
                                                        /**
                                                         * messageType 13 is for sales enquiry
                                                         *
                                                         */
                                                        var messageType = 13;
                                                        var operationType = 0;
                                                        var iphoneId = null;
                                                        var messageId = 0;
                                                        var masterid = notDetailsRes[0][count].masterid;
                                                        console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);

                                                        notification.publish(receiverId, senderTitle, groupTitle, groupId,
                                                            messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                        console.log("Notification Send");
                                                    }
                                                }
                                            }

                                        }
                                    }
                                    else {
                                        console.log('get_subuser_enquiry:user details not loaded');
                                    }
                                }
                                else {
                                    console.log('get_subuser_enquiry:user details not loaded');
                                }
                            });
                        }
                        else {
                            console.log("Lead received for vendor's own product");
                        }
                    }
                    else {
                        console.log("get_user_ezeid : Invalid EZEID");
                    }
                }
                else {
                    console.log("get_user_ezeid : Invalid EZEID");
                }
            }
            else {
                console.log("get_user_ezeid : Invalid EZEID");
            }
        }
        else {
            console.log("get_user_ezeid : Invalid EZEID");
        }

    });
};


/**
 * Procurement Submit Enquiry
 * @param req
 * @param res
 * @param next
 *
 * @service-param message <string>
 * @service-param notes <string>
 */


Procurement.prototype.procurementSubmitEnquiry = function(req,res,next){
    console.log("test");
    var id = parseInt(req.body.id);
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(req.is('json')) {
        if (!req.body.token) {
            error.token = 'Invalid token';
            validationFlag *= false;
        }
        if (id) {
            if (isNaN(id)) {
                error.id = 'Invalid id of enquiry';
                validationFlag *= false;
            }
        }
        else {
            id = 0;
        }
        if (!validator.isLength((req.body.title), 2, 100)) {
            error.title = 'Title should be atleast 2 character';
            validationFlag *= false;
        }
        if (!validationFlag) {
            responseMessage.error = error;
            responseMessage.message = 'Please check the errors';
            res.status(400).json(responseMessage);
            console.log(responseMessage);
        }
        else {
            try {
                st.validateToken(req.body.token, function (err, tokenResult) {
                    if (!err) {
                        if (tokenResult) {
                            var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.title) + ',' + st.db.escape(req.body.refno)
                                + ',' + st.db.escape(req.body.dd) + ',' + st.db.escape(req.body.message) + ',' + st.db.escape(req.body.cezeone) + ',' +
                                st.db.escape(req.body.notes) + ',' + st.db.escape(id);
                            var procQuery = 'CALL psubmit_enquiry(' + procParams + ')';
                            console.log(procQuery);
                            st.db.query(procQuery, function (err, results) {
                                if (!err) {
                                    console.log(results);
                                    if (results) {
                                        if (results[0]) {
                                            if (results[0][0]) {
                                                if (results[0][0].id) {
                                                    var eId = results[0][0].id;
                                                    var attachQuery='';
                                                    if (req.body.attachmentArray) {
                                                        for (var eCount = 0; eCount < req.body.attachmentArray.length; eCount++) {
                                                            var attachParam = st.db.escape(eId) + ',' +
                                                                st.db.escape(req.body.attachmentArray[eCount].url) + ',' +
                                                                st.db.escape(req.body.attachmentArray[eCount].fn);

                                                            attachQuery += ("CALL psave_enquiry_attachment(" +
                                                            attachParam + ");");

                                                        }
                                                    }
                                                    if(attachQuery){
                                                        st.db.query(attachQuery,function(err,attchResult){
                                                            console.log(attachQuery);
                                                            if(err){
                                                                console.log('Error in procedure : psend_Procurement_enquiry');
                                                                sendResponse(500,{
                                                                    status : false,
                                                                    message : "Internal Server Error",
                                                                    data : null,
                                                                    error : {
                                                                        server : "Internal Server Error"
                                                                    }
                                                                });
                                                            }

                                                        });
                                                    }
                                                    else{
                                                        areSalesEnquirySentToVendors = true;
                                                        if(areSalesEnquirySentToVendors && areMailSentToVendors){
                                                            sendResponse(200,{
                                                                status : true,
                                                                message : "",
                                                                data : {
                                                                    mail_count  : mailSentCount,
                                                                    already_submitted : alreadySubmitted,
                                                                    not_verified : notVerfied,
                                                                    submitted : submitted
                                                                },
                                                                error : null
                                                            });

                                                        }

                                                    }
                                                    var areMailSentToVendors = false;
                                                    var areSalesEnquirySentToVendors = false;

                                                    var mailSentCount = 0;
                                                    var alreadySubmitted = 0;
                                                    var notVerfied = 0;
                                                    var submitted = 0;
                                                    var sendResponse = function(respCode,respObj){
                                                        res.status(respCode).json(respObj);
                                                    };
                                                    var sendSalesEnquiryToVendors = function(vendorList){
                                                        var salesEnqComQuery = "";
                                                        for(var vCount=0; vCount < vendorList.length; vCount++){
                                                            var salesEnqParam = st.db.escape(req.body.token) + ',' +
                                                            st.db.escape(vendorList[vCount].ezeoneId) + ',' +
                                                            st.db.escape(vendorList[vCount].vendorContactName) + ',' +
                                                            st.db.escape(vendorList[vCount].vendorEmail) + ',' +
                                                            st.db.escape(vendorList[vCount].vendorPhone) + ',' +
                                                            st.db.escape(req.body.message) + ',' +
                                                            st.db.escape(req.body.notes) + ',' +
                                                            st.db.escape(vendorList[vCount].procId) + ',' +
                                                            st.db.escape(eId);
                                                            salesEnqComQuery += ("CALL psend_Procurement_enquiry("+
                                                            salesEnqParam +
                                                            ");");

                                                        }
                                                        console.log('psend_Procurement_enquiry : ',salesEnqComQuery);
                                                        if(salesEnqComQuery){
                                                            st.db.query(salesEnqComQuery,function(err,saveEnqResult){
                                                                if(!err){
                                                                    areSalesEnquirySentToVendors = true;
                                                                    if(saveEnqResult){
                                                                        //console.log(saveEnqResult.length/2,"messaget");
                                                                        //console.log(saveEnqResult[0][0].msg,"messagecount");
                                                                        for(var i=0; i < saveEnqResult.length/2; i++) {
                                                                            var count = (i) ? 2 * i : 0;
                                                                            console.log(vendorList[i].ezeoneId);
                                                                            console.log(saveEnqResult);
                                                                            if(saveEnqResult[count][0].msg=="already submitted"){
                                                                                console.log();
                                                                                alreadySubmitted = alreadySubmitted+1;
                                                                            }
                                                                            else if(saveEnqResult[count][0].msg=="not verified"){
                                                                                notVerfied = notVerfied+1;
                                                                            }
                                                                            else if(saveEnqResult[count][0].msg=="submitted"){
                                                                                submitted = submitted+1;

                                                                                /**
                                                                                 * to send notification to subusers
                                                                                 */
                                                                                var functionType = 0;
                                                                                sendNotiToSubuser(req.body.token,vendorList[i].ezeoneId,
                                                                                    functionType,saveEnqResult[count][0].rid);
                                                                            }
                                                                        }
                                                                    }
                                                                    if(areSalesEnquirySentToVendors && areMailSentToVendors){
                                                                        sendResponse(200,{
                                                                            status : true,
                                                                            message : "",
                                                                            data : {
                                                                                mail_count  : mailSentCount,
                                                                                already_submitted : alreadySubmitted,
                                                                                not_verified : notVerfied,
                                                                                submitted : submitted
                                                                            },
                                                                            error : null
                                                                        });

                                                                    }
                                                                }
                                                                else{
                                                                    console.log('Error in procedure : psend_Procurement_enquiry');
                                                                    sendResponse(500,{
                                                                        status : false,
                                                                        message : "Internal Server Error",
                                                                        data : null,
                                                                        error : {
                                                                            server : "Internal Server Error"
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                        else{
                                                            areSalesEnquirySentToVendors = true;
                                                            if(areSalesEnquirySentToVendors && areMailSentToVendors){
                                                                sendResponse(200,{
                                                                    status : true,
                                                                    message : "",
                                                                    data : {
                                                                        mail_count  : mailSentCount,
                                                                        already_submitted : alreadySubmitted,
                                                                        not_verified : notVerfied,
                                                                        submitted : submitted
                                                                    },
                                                                    error : null
                                                                });

                                                            }
                                                        }
                                                    };
                                                    var sendMailToVendors = function(vendorEmailList){
                                                        /**
                                                         * @todo
                                                         * Mail merge one harcoded template and
                                                         * send mail to the list of vendors passed to this function
                                                         */

                                                        console.log(vendorEmailList,"vendorEmailList");

                                                        var procParams = st.db.escape(req.body.token);
                                                        var procQuery = 'CALL pSendMailerDetails(' + procParams + ')';
                                                        st.db.query(procQuery, function (err, MailerDetailsResult) {
                                                            if (!err) {
                                                                console.log(MailerDetailsResult, "MailerDetailsResult");
                                                                if (MailerDetailsResult) {
                                                                    if (MailerDetailsResult.length > 0) {
                                                                        var output = MailerDetailsResult[0];
                                                                        var name = output[0].Name;  //indivdual name business company name
                                                                        var logedinuser = output[0].logedinuser;
                                                                        var fromEmail = output[0].FromEmailId;
                                                                        var mn = output[0].mn;
                                                                        console.log(fromEmail, "from");
                                                        for (var i = 0; i < vendorEmailList.length; i++) {
                                                            mailerApi.sendMail('proposal_template', {
                                                                Name : name,
                                                                RequirementDescription : req.body.message,
                                                                LoggedInName : logedinuser,
                                                                email : fromEmail,
                                                                mobile : mn

                                                            }, '', vendorEmailList[i]);
                                                        }

                                                        areMailSentToVendors = true;
                                                        if(areSalesEnquirySentToVendors && areMailSentToVendors){
                                                            sendResponse(200,{
                                                                status : true,
                                                                message : "mail send successfully",
                                                                data : null,
                                                                error : null
                                                            });

                                                        }

                                                        }
                                                    }
                                                }
                                            });
                                                    };

                                                    var saveEnqArrayFn = function(vendorArray){
                                                        var comSaveEnquiryVendor = "";
                                                        if(vendorArray){
                                                            for(var i = 0; i < vendorArray.length; i++){

                                                                var saveEnqQuery = "CALL psave_enquiry_vendors("+
                                                                    st.db.escape(req.body.token) + ',' +
                                                                    st.db.escape(eId) + ',' +
                                                                    st.db.escape(vendorArray[i].vezeoneid) + ',' +
                                                                    st.db.escape(vendorArray[i].vn) + ',' +
                                                                    st.db.escape(vendorArray[i].cn) + ',' +
                                                                    st.db.escape(vendorArray[i].phone_no) + ',' +
                                                                    st.db.escape(vendorArray[i].email) + ',' +
                                                                    st.db.escape(vendorArray[i].vid)
                                                                    + ");";
                                                                comSaveEnquiryVendor += saveEnqQuery;
                                                            }

                                                            console.log('comSaveEnquiryVendor',comSaveEnquiryVendor);

                                                            st.db.query(comSaveEnquiryVendor, function (err, EnqVendorResult) {
                                                                if (!err) {
                                                                    if(EnqVendorResult){
                                                                        //console.log(EnqVendorResult,"res");
                                                                        //console.log(EnqVendorResult[2][0].id,"id");

                                                                        /**
                                                                         * Vendor List which are registerd on EZEOne Platform
                                                                         * @type {Array}
                                                                         */
                                                                        var vendorIdList = [];
                                                                        /**
                                                                         * Vendor List which are not registerd on EZEOne Platform
                                                                         * so that we can send them individual mail after mail merge
                                                                         * @type {Array}
                                                                         */
                                                                        var vendorEmailList = [];


                                                                        for(var i=0; i < vendorArray.length; i++){
                                                                            var count = (i) ? 2 * i : 0;
                                                                            console.log(count,"count");
                                                                            if(vendorArray[i].vezeoneid){
                                                                                vendorIdList.push({
                                                                                    procId : EnqVendorResult[count][0].id,
                                                                                    ezeoneId : vendorArray[i].vezeoneid,
                                                                                    vendorName : vendorArray[i].vn,
                                                                                    vendorContact : vendorArray[i].cn,
                                                                                    vendorEmail : vendorArray[i].email,
                                                                                    vendorPhone : vendorArray[i].phone_no,
                                                                                    vendorContactName : vendorArray[i].cezeone,
                                                                                    vendorId : vendorArray[i].vid
                                                                                });
                                                                            }
                                                                            else if(vendorArray[i].email){
                                                                                /**
                                                                                 * @todo Ask vedha about mail templates
                                                                                 */
                                                                                vendorEmailList.push(vendorArray[i].email);
                                                                            }

                                                                        }

                                                                        /**
                                                                         * Sending sales enquiry to those vendors which are on EZEID platfomr
                                                                         */
                                                                        sendSalesEnquiryToVendors(vendorIdList);

                                                                        /**
                                                                         * Sending mail to those vendors which are not on EZEOne Platform
                                                                         * @todo
                                                                         */
                                                                        sendMailToVendors(vendorEmailList);




                                                                    }
                                                                    else{
                                                                        responseMessage.data = null;
                                                                        console.log('Data not loaded for psave_enquiry_vendors');
                                                                        res.status(500).json(responseMessage);
                                                                    }
                                                                }
                                                                else{
                                                                    responseMessage.error = {
                                                                        server: 'Internal Server Error'
                                                                    };
                                                                    responseMessage.message = 'An error occurred !';
                                                                    res.status(500).json(responseMessage);
                                                                    console.log('Error : procurementSubmitEnquiry ', err);
                                                                    var errorDate = new Date();
                                                                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                                                                }
                                                            });
                                                        }
                                                        else{
                                                            sendResponse(200,{
                                                                status : false,
                                                                data : {
                                                                    mail_count  : 0,
                                                                    already_submitted : 0,
                                                                    not_verified : 0,
                                                                    submitted : 0
                                                                },
                                                                message : "No vendors are there in the list to send enquiries",
                                                                error : {
                                                                    vendorArray : "No vendors in the list to send enquiry"
                                                                }
                                                            })
                                                        }

                                                    };

                                                    saveEnqArrayFn(req.body.vendorArray);



                                                }
                                                else {
                                                    responseMessage.status = false;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'Error in adding enquiry';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in adding enquiry';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in adding enquiry';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }

                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in adding enquiry';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.error = {
                                        server: 'Internal Server Error'
                                    };
                                    responseMessage.message = 'An error occurred !';
                                    res.status(500).json(responseMessage);
                                    console.log('Error : psubmit_enquiry ', err);
                                    var errorDate = new Date();
                                    console.log(errorDate.toTimeString() + ' ......... error ...........');
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
                            console.log('psubmit_enquiry: Invalid token');
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'An error occurred !';
                        res.status(500).json(responseMessage);
                        console.log('Error : psubmit_enquiry ', err);
                        var errorDate = new Date();
                        console.log(errorDate.toTimeString() + ' ......... error ...........');
                    }
                });
            }
            catch (ex) {
                responseMessage.error = {
                    server: 'Internal Server Error'
                };
                responseMessage.message = 'An error occurred !';
                res.status(500).json(responseMessage);
                console.log('Error psubmit_enquiry :  ', ex);
                var errorDate = new Date();
                console.log(errorDate.toTimeString() + ' ......... error ...........');
            }
        }
    }
    else{
        responseMessage.error = "Accepted content type is json only";
        res.status(400).json(responseMessage);
    }
};

/**
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description save vendors
 * @param token <string> token of login user
 * @param vezeoneid <int>  vendor ezeone id
 * @param vn <string>  vendor name
 * @param cn <string> contact name
 * @param keywords <string>  keywords of the vendor
 * @param a1 <string> Address of vendor line 1
 * @param a2 <string> Address of vendor line 2
 * @param c <string>  city title
 * @param s <string> state title
 * @param ci <string> country title
 * @param pc <string>  postal code
 * @param ce <string>  contact email id
 * @param pn <string> phone number
 * @param rt <string> rating of vendor
 * @param id <string> id to addd vendor
 *
 */
Procurement.prototype.procurementSaveVendors = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if(!req.body.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.body.vn) {
        error.title = 'Invalid Vendor name';
        validationFlag *= false;
    }
    if (!req.body.cn) {
        error.title = 'Invalid Contact name';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    /** if (!validator.isLength((req.body.a1), 3,50)) {
        error.a1 = 'Address should be atleast 3 characters';
        validationFlag *= false;
    }
     if (!req.body.c){
        error.c = 'City name Invalid';
        validationFlag *= false;
    }
     if (!req.body.s){
        error.s = 'State name Invalid';
        validationFlag *= false;
    }
     if (!req.body.cn){
        error.s = 'Country name Invalid';
        validationFlag *= false;
    }*/
    else {
        try {
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.vezeoneid)
                            + ',' + st.db.escape(req.body.vn)+ ',' + st.db.escape(req.body.cn)+ ',' + st.db.escape(req.body.keywords)
                            + ',' + st.db.escape(req.body.a1)+ ',' + st.db.escape(req.body.a2)+ ',' + st.db.escape(req.body.c)
                            + ',' + st.db.escape(req.body.s)+ ',' + st.db.escape(req.body.ci)+ ',' + st.db.escape(req.body.pc)
                            + ',' + st.db.escape(req.body.ce)+ ',' + st.db.escape(req.body.pn)+ ',' + st.db.escape(req.body.rt)
                            + ',' + st.db.escape(req.body.id);
                        var procQuery = 'CALL psave_vendors(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'vendor details added successfully';
                                responseMessage.data = results[0][0];
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : psave_vendors ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');
                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementSaveVendors: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementSaveVendors ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error hrisSaveLeaveRegi :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get Vendor
 * @param token <string> token of login user
 * @param filterstr <varchar> filter string
 *
 */
Procurement.prototype.procurementGetVendors = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.filterstr){
        req.query.filterstr = '';
    }

    if(!validationFlag){

        responseMessage.error = {token : 'Invalid Token'};
        responseMessage.message = 'Please check all the errors';
        res.status(401).json(responseMessage);
        console.log(responseMessage);

        //responseMessage.error = error;
        //responseMessage.message = 'Please check the errors';
        //res.status(400).json(responseMessage);
        //console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.query.token) + ',' + st.db.escape(req.query.filterstr);
                        var procQuery = 'CALL pget_vendorList(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Vendor List loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Vendor List are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Vendor List are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Vendor List are not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pget_vendorList ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementGetVendors: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementGetVendors ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementGetVendors :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

/**
 * @type : DELETE
 * @param req
 * @param res
 * @param next
 * @description DELETE vendor
 * @param token <string> token of login user
 * @param id <int> vendor id
 *
 */
Procurement.prototype.procurementDelVendor = function(req,res,next){
    var id = parseInt(req.params.id);
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(id) || (id <= 0)){
        error.id = 'Invalid id of Vendor';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(id);
                        var procQuery = 'CALL pDelete_vendor(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'vendor deleted successfully';
                                responseMessage.data = null;
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pDelete_vendor ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementDelVendor: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementDelVendor ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementDelVendor :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get enquiry attachments
 * @param token <string> token of login user
 * @param eid <int>  enquiry id
 *
 */
Procurement.prototype.procurementGetEnqAttchment = function(req,res,next){
    var eId = parseInt(req.query.eid);
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(eId) || (eId <= 0)){
        error.eid = 'Invalid Enquiry Attachment id';
        validationFlag *= false;
    }

    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams =  st.db.escape(eId);
                        var procQuery = 'CALL pget_enquiry_attachment(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Enquiry Attachments loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Enquiry Attachments are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Enquiry Attachments are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Enquiry Attachments are not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pget_enquiry_attachment ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementGetEnqAttchment: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementGetEnqAttchment ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementGetEnqAttchment :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

/**
 * @type : DELETE
 * @param req
 * @param res
 * @param next
 * @description DELETE enquiry attachment
 * @param token <string> token of login user
 * @param id <int> enquiry attachment id
 *
 */
Procurement.prototype.procurementDelEnqAttachment = function(req,res,next){
    var id = parseInt(req.params.id);
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(id) || (id <= 0)){
        error.id = 'Invalid id of Enquiry Attachment';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(id);
                        var procQuery = 'CALL pdelete_enquiry_attachment(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Enquiry Attchment deleted successfully';
                                responseMessage.data = null;
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pdelete_enquiry_attachment ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementDelEnqAttachment: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementDelEnqAttachment ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementDelEnqAttachment :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get purchase transactions
 * @accepts json
 * @param token <string> token of login user
 *
 */
Procurement.prototype.procurementGetPurchaseTrans = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if(!validationFlag){
        //responseMessage.error = error;
        //responseMessage.message = 'Please check the errors';
        //res.status(400).json(responseMessage);
        //console.log(responseMessage);
        responseMessage.error = {token : 'Invalid Token'};
        responseMessage.message = 'Please check all the errors';
        res.status(401).json(responseMessage);
        console.log(responseMessage);

    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams =  st.db.escape(req.query.token);
                        var procQuery = 'CALL pget_purchase_transaction(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Purchase Transaction loaded successfully';
                                            responseMessage.data=results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Purchase Transaction are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Purchase Transaction are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Purchase Transaction are not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pget_purchase_transaction ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementGetPurchaseTrans: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementGetPurchaseTrans ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementGetPurchaseTrans :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};


/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get purchase transaction details
 * @accepts json
 * @param token <string> token of login user
 * @param enquiryid <string> enquiry id of login user
 *
 *
 */
Procurement.prototype.procurementGetPurchaseTransDetails = function(req,res,next){
    var enquiryId = parseInt(req.query.enquiryid);
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(enquiryId) || (enquiryId <= 0)){
        error.enquiryid = 'Invalid enquiry id';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams =  st.db.escape(enquiryId);
                        var procQuery = 'CALL pget_purchase_transaction_details(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {

                                        if (results[0].length > 0) {

                                            //for(var i=0;i<results[0].length;i++){
                                            //    if(results[0][0].proposal_document!=''){
                                            //        console.log(results[0][0].proposal_document);
                                            //        var str='https://storage.googleapis.com/ezeone/'
                                            //        var str1 = results[0][0].proposal_document;
                                            //        var str2=str.concate(str1);
                                            //        console.log("sr",str1);
                                            //    }
                                            //}
                                            var output =[];
                                            for (var i = 0; i < results[0].length; i++) {
                                                var result = {};
                                                result.tid = results[0][i].tid;
                                                result.ezeoneid = results[0][i].ezeoneid;
                                                result.vendor_name = results[0][i].vendor_name;
                                                result.contact_name = results[0][i].contact_name;
                                                result.proposal_amount = results[0][i].proposal_amount;
                                                result.proposal_reference = results[0][i].proposal_reference;
                                                result.proposal_date = results[0][i].proposal_date;
                                                result.vendor_emailid = results[0][i].vendor_emailid;
                                                result.vendor_contactname = results[0][i].vendor_contactname;
                                                result.PO_nu = results[0][i].PO_nu;
                                                result.PO_date = results[0][i].PO_date;
                                                result.proposal_document = (results[0][i].proposal_document) ?(results[0][i].proposal_document): '';
                                                result.total_count = results[0][i].count;
                                                result.vendor_contact_email = results[0][i].vce;
                                                //result.proposal_document = (results[0][i].proposal_document) ?(results[0][i].proposal_document):
                                                //req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + results[0][i].proposal_document;
                                                output.push(result);
                                            }

                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Purchase Transaction details loaded successfully';
                                            responseMessage.data=output;
                                            responseMessage.count = results[0][0].count;
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Purchase Transaction details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Purchase Transaction details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Purchase Transaction details are not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pget_purchase_transaction_details ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementGetPurchaseTransDetails: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementGetPurchaseTransDetails ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementGetPurchaseTransDetails :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};


/**
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description save po template
 * @accepts json
 * @param token <string> token of login user
 * @param temp_id <int> id is template id
 * @param title <string> title of template
 * @param editortext <string> editor text
 *
 */
Procurement.prototype.procurementSavePoTemplate = function(req,res,next){
    var tId = parseInt(req.body.temp_id);
    //var editorText = (req.body.editortext) ? (req.body.editortext) : '';
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if(!req.body.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (tId){
        if (isNaN(tId)) {
            error.temp_id = 'Invalid id of temp id';
            validationFlag *= false;
        }
    }
    else {
        tId = 0;
    }
    if (!validator.isLength((req.body.title), 2, 150)) {
        error.title = 'Title should be atleast 2 character';
        validationFlag *= false;
    }
    if(req.body.editortext==''){
        error.editortext = 'Invalid Editortext';
        validationFlag *= false;
        console.log("test");
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(tId)
                            + ',' + st.db.escape(req.body.title)+ ',' + st.db.escape(req.body.editortext);
                        var procQuery = 'CALL psave_POtemplate(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            console.log(results[0][0].id);
                                            if (results[0][0].id) {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Purchase Order saved successfully';
                                                responseMessage.data = {
                                                    id : results[0][0].id
                                                };
                                                res.status(200).json(responseMessage);
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in saving HRM Purchase Order';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in saving HRM Purchase Order';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in saving HRM Purchase Order';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in saving HRM Purchase Order';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : psave_POtemplate ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementSavePoTemplate: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementSavePoTemplate ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementSavePoTemplate :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get Potemplate
 * @param token <string> token of login user
 *
 */
Procurement.prototype.procurementGetPoTemplate = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if(!validationFlag){
        //responseMessage.error = error;
        //responseMessage.message = 'Please check the errors';
        //res.status(400).json(responseMessage);
        //console.log(responseMessage);
        responseMessage.error = {token : 'Invalid Token'};
        responseMessage.message = 'Please check all the errors';
        res.status(401).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.query.token);
                        var procQuery = 'CALL pGet_POTemplates(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Purchase Order Template loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Purchase Order Template are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Purchase Order Template are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Purchase Order Template  are not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pGet_POTemplates ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementGetPoTemplate: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementGetPoTemplate ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementGetPoTemplate :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

/**
 * @type : DELETE
 * @param req
 * @param res
 * @param next
 * @description DELETE Po template
 * @param token <string> token of login user
 * @param id <int>
 *
 */
Procurement.prototype.procurementDelPoTemplate = function(req,res,next){
    //chalk.blue('Hello') + 'World' + chalk.red('!');
    var id = parseInt(req.params.id);
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(id) || (id <= 0)){
        error.id = 'Invalid id of purchase order template';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.query.token)+ ',' + st.db.escape(id);
                        var procQuery = 'CALL pdelete_POTemplate(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Purchase Order Tamplate deleted successfully';
                                responseMessage.data = null;
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pdelete_POTemplate ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementDelPoTemplate: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementDelPoTemplate ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementDelPoTemplate :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

/**
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description save po details
 * @accepts json
 * @param token <string> token of login user
 * @param vendor_id <int> vendor id
 * @param po_nu <string> purchase order number
 * @param po_date <Datetime> purchase order datetime
 * @param po_order <text> purchase order attachment
 *
 */
Procurement.prototype.procurementSavePoDetails = function(req,res,next){
    var vId = parseInt(req.body.vendor_id);
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if(!req.body.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(vId)){
        error.vendor_id = 'Invalid Vendor Id';
        validationFlag *= false;
    }
    if (!req.body.po_nu){
        error.po_nu = 'Invalid Purchase order no';
        validationFlag *= false;
    }
    if (!req.body.po_date){
        error.po_date = 'Invalid Purchase order Datetime';
        validationFlag *= false;
    }
    if (!req.body.po_order){
        error.po_order = 'Invalid Purchase order Datetime';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(vId)
                            + ',' + st.db.escape(req.body.po_nu)+ ',' + st.db.escape(req.body.po_date)
                            + ',' + st.db.escape(req.body.po_order)+ ',' + st.db.escape(req.body.notes);
                        var procQuery = 'CALL psave_POdetails(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Purchase order details added successfully';
                                responseMessage.data = req.body;
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : psave_POdetails ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementSavePoDetails: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementSavePoDetails ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementSavePoDetails :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @type : PUT
 * @param req
 * @param res
 * @param next
 * @server_param
 * @description updating proposal details
 * @param token <string> token of login user
 * @param vendor_id <int> vendor id
 * @param pro_ref <string> Proposal reference number
 * @param pro_date <Datetime>  Proposal Datetime
 * @param pro_amount <decimal>  Proposal amount
 * @param pro_doc <text>  Proposal document
 * @param vendor_emailid <text> vendor emailid
 * @param vendor_cn <text> vendor contact name
 * @param notes <text> notes
 */
Procurement.prototype.procurementUpdateProposalDetails = function(req,res,next)     {
    var vId = parseInt(req.body.vendor_id);
    var proDate = moment(req.body.pro_date,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if(!req.body.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(vId) || (vId <= 0)){
        error.vendor_id = 'Invalid Vendor Id';
        validationFlag *= false;
    }
    if(!req.body.pro_ref){
        error.pro_ref = 'Invalid Po reference no';
        validationFlag *= false;
    }
    if (!validator.isEmail(req.body.vendor_emailid)) {
        error.vendor_emailid = 'Invalid Email';
        validationFlag *= false;
    }
    if(!proDate){
        error.pro_date = 'Invalid date';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            var image = null;
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(vId)
                            + ',' + st.db.escape(req.body.pro_ref)+ ',' + st.db.escape(proDate)
                            + ',' + st.db.escape(req.body.pro_amount)+ ',' + st.db.escape(req.body.pro_doc)
                            + ',' + st.db.escape(req.body.vendor_emailid)+ ',' + st.db.escape(req.body.vendor_cn)
                            + ',' + st.db.escape(req.body.notes);

                        var procQuery = 'CALL pupdate_proposaldetails(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Proposal details updated successfully';
                                responseMessage.data = req.body;
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pupdate_proposaldetails ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');
                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementUpdateProposalDetails: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementUpdateProposalDetails ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementUpdateProposalDetails :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

}

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get proposal details
 * @param token <string> token of login user
 * @param vendor_id <int> vendor id
 *
 */
Procurement.prototype.procurementGetProposalDetails = function(req,res,next){
    var vId = parseInt(req.query.vendor_id);
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(vId) || (vId <= 0)){
        error.vendor_id = 'Invalid Venodor id';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(vId);
                        var procQuery = 'CALL pGet_proposaldetails(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Proposal details loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Proposal details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Proposal details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Proposal details  are not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pGet_proposaldetails ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementGetPoTemplate: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementGetPoDetails ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementGetPoDetails :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get vendor ezeone details
 * @accepts json
 * @param token <string> token of login user
 * @param ezeone_id <int> ezeone id
 *
 */
Procurement.prototype.procurementGetVdEzeDetails = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.ezeone_id){
        error.ezeone_id = 'Invalid ezeone id';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);

    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.query.ezeone_id);
                        var procQuery = 'CALL pGet_vendorezeone_details(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            if(results[0][0].message != "EzeoneID is not verified"){
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Vendor Ezeone details are loaded successfully';
                                                responseMessage.data = results[0];
                                                res.status(200).json(responseMessage);
                                            }
                                            else{
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'EzeoneID is not verified';
                                                responseMessage.data = results[0];
                                                res.status(200).json(responseMessage);
                                            }

                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Vendor Ezeone details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Vendor Ezeone details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Vendor Ezeone details  are not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pGet_vendorezeone_details ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementGetVdEzeDetails: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementGetVdEzeDetails ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementGetVdEzeDetails :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get transaction details for individual
 * @accepts json
 * @param token <string> token of login user
 * @param vendor_id <int> vendor id
 *
 */
Procurement.prototype.procurementLoadTransDetails = function(req,res,next){
    var vId = parseInt(req.query.vendor_id);
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(vId) || (vId <= 0)) {
        error.vendor_id = 'Invalid vendor id';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);

    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(vId)+ ',' + st.db.escape(req.query.token);
                        var procQuery = 'CALL pload_purchasetrans_details(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Purchase transaction details loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Purchase transaction details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Purchase transaction details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Purchase transaction details  are not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pload_purchasetrans_details ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

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
                        console.log('procurementLoadTransDetails: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementLoadTransDetails ', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementLoadTransDetails :  ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};


/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get vendor details for individual
 * @accepts json
 * @param token <string> token of login user
 * @param vendor_id <int> vendor id
 *
 */
Procurement.prototype.procurementGetVendorDetails = function(req,res,next){
    var vId = parseInt(req.query.vendor_id);
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.query.vendor_id)) || (parseInt(req.query.vendor_id) <= 0)){
        error.vendor_id = 'Invalid vendor id';
        validationFlag *= false;
    }
    //if(!vId){
    //    error.vendor_id = 'Invalid vendor id';
    //    validationFlag *= false;
    //}
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);

    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {




                        var procParams = st.db.escape(req.query.vendor_id);
                        var procQuery = 'CALL pget_vendor_details(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Vendor details loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Vendor details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Vendor details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Vendor details  are not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pget_vendor_details ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementGetVendorDetails: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementGetVendorDetails ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementGetVendorDetails :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get po details
 * @param token <string> token of login user
 * @param vender_id  <INT> vendor id
 *
 */
Procurement.prototype.procurementGetPoDetails = function(req,res,next){
    var vId = parseInt(req.query.vendor_id);
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(vId) || (vId <= 0)){
        error.vendor_id = 'Invalid Vendor id';
        validationFlag *= false;
    }

    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(vId);
                        var procQuery = 'CALL pget_POdetails(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Po details loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Po details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Po details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Po details are not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pget_vendorList ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementGetPoDetails: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementGetPoDetails ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementGetPoDetails :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

///**
// * Method : POST
// * @param req
// * @param res
// * @param next
// */
//Procurement.prototype.sendPoDFFMail = function(req,res,next){
//    /**
//     * @todo SendMailer
//     */
//
//    try {
//
//        res.setHeader("Access-Control-Allow-Origin", "*");
//        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//
//        var Token = req.body.token;
//        var TemplateID = req.body.TemplateID;
//        var poAttachment = req.body.poAttachment;
//        var vendor_id=req.body.vendor_id;
//
//        var toMailID ='';
//        var ccemailid = '';
//        var name='';
//        var fromEmail='';
//        var pro_ref='';
//        var pro_date='';
//        var vendor_cn='';
//        var logedinuser='';
//        var pro_att='';
//
//
//        var RtnResponse = {
//            IsSent: false
//        };
//        //if (toMailID != null) {
//
//        if (Token && TemplateID ) {
//            st.validateToken(Token, function (err, tokenResult) {
//                if (!err) {
//                    if (tokenResult) {
//                        //var query = st.db.escape(Token) + ', ' +st.db.escape(TID);
//                        //var query = 'Select FirstName, LastName, CompanyName,ifnull(SalesMailID," ") as SalesMailID from tmaster where TID in (' + TID + ')';
//                        //console.log(GetResult[0]
//                        var procParams = st.db.escape(Token);
//                        var procQuery = 'CALL pSendMailerDetails(' + procParams + ')';
//                        console.log(procQuery);
//                        st.db.query(procQuery, function (err, MailerDetailsResult) {
//                            //console.log(MailerDetailsResult,"MailerDetailsResult");
//                            if (!err) {
//                                console.log(MailerDetailsResult,"MailerDetailsResult");
//                                if (MailerDetailsResult) {
//                                    if (MailerDetailsResult.length > 0) {
//                                        var output = MailerDetailsResult[0];
//                                        name = output[0].Name;  //indivdual name business company name
//                                        logedinuser = output[0].logedinuser;
//                                        fromEmail = output[0].FromEmailId;
//                                        console.log(fromEmail,"from");
//                                    }
//                                }
//                            }
//                        });
//
//                        st.db.query('CALL pGet_proposaldetails(' + vendor_id + ')', function (err, vendordetails) {
//                            console.log(vendordetails,"vendordetails");
//                            if (!err) {
//                                if (vendordetails) {
//                                    if (vendordetails.length > 0) {
//                                        var output = vendordetails[0];
//                                        pro_ref = output[0].pro_ref;
//                                        pro_date = output[0].pro_date;
//                                        vendor_cn= output[0].vendor_cn;
//                                        toMailID=output[0].vendor_emailid;
//                                        ccemailid=output[0].emailid;
//                                        pro_att=output[0].pro_doc;
//                                    }
//                                }
//                            }
//                        });
//                        console.log(pro_att,"pro_att");
//                        fs.readFile(pro_att , function(err, data_proposal) {
//                            //data_prop = data_proposal;
//                            console.log(data_proposal,"proposal");
//
//                        });
//
//
//                        var templateQuery = 'Select * from mmailtemplate where TID = ' + st.db.escape(TemplateID);
//                        st.db.query(templateQuery, function (err, TemplateResult) {
//                            if (!err) {
//                                if (TemplateResult) {
//                                    if (TemplateResult.length > 0) {
//                                        console.log(TemplateResult,"TemplateResult");
//                                        RtnResponse.IsSent = true;
//                                        for (var i = 0; i < TemplateResult.length; i++) {
//                                            var mailOptions = {
//                                                replyto: fromEmail,
//                                                to: toMailID,
//                                                cc:ccemailid,
//                                                subject: TemplateResult[0].Subject,
//                                                html: TemplateResult[0].Body, // html body
//                                                attachment: pro_att // html body
//
//                                            };
//                                            mailOptions.html = mailOptions.html.replace("[ContactName]", vendor_cn);
//                                            mailOptions.html = mailOptions.html.replace("[ProposalNumber]", pro_ref);
//                                            mailOptions.html = mailOptions.html.replace("[ProposalDate]", pro_date);
//                                            mailOptions.html = mailOptions.html.replace("[ClientName]", name);
//                                            mailOptions.html = mailOptions.html.replace("[LoginUserName]", logedinuser);
//
//
//                                            var email = new sendgrid.Email();
//                                            email.from = mailOptions.replyto;
//                                            email.to = mailOptions.to;
//                                            email.cc=mailOptions.cc;
//                                            email.subject = mailOptions.subject;
//                                            email.html = mailOptions.html;
//                                            //email.files   = [{filename: 'proposal_document.jpg', content: data_proposal}],
//                                            email.addFile({
//                                                filename: '73d5a90d-1e7b-4373-a7ab-f9abcc26437f.txt',
//                                                url: 'https://storage.googleapis.com/ezeone/73d5a90d-1e7b-4373-a7ab-f9abcc26437f.txt'
//                                            });
//                                            console.log(email.files);
//                                            console.log('send grid......');
//
//                                            sendgrid.send(email, function (err, result) {
//                                                console.log(err);
//                                                if (!err) {
//                                                    var post = {
//                                                        MessageType: 9,
//                                                        Priority: 5,
//                                                        ToMailID: mailOptions.to,
//                                                        Subject: mailOptions.subject,
//                                                        Body: mailOptions.html,
//                                                        Replyto: mailOptions.replyto,
//                                                        SentStatus: 1
//                                                    };
//
//                                                    //console.log(post);
//                                                    var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
//                                                        // Neat!
//                                                        if (!err) {
//                                                            console.log(result);
//                                                            console.log('FnSendBulkMailer: Mail saved Successfully');
//
//                                                            //CallBack(null, RtnMessage);
//                                                        }
//                                                        else {
//                                                            console.log('FnSendBulkMailer: Mail not Saved Successfully');
//                                                            // CallBack(null, null);
//                                                        }
//                                                    });
//                                                }
//                                                else {
//                                                    console.log('FnSendBulkMailer: Mail not send Successfully');
//                                                    // CallBack(null, null);
//                                                }
//                                            });
//                                            //console.log('FnSendBulkMailer:Mail details sent for processing');
//                                            //console.log(mailOptions);
//                                        }
//                                        res.send(RtnResponse);
//
//                                    }
//                                    else {
//                                        console.log('FnGetTemplateDetails:No Template Details found');
//                                        res.json(null);
//                                    }
//                                }
//                                else {
//                                    console.log('FnGetTemplateDetails:No Template Details found');
//                                    res.json(null);
//                                }
//                            }
//                            else {
//                                console.log('FnGetTemplateDetails:Error in getting template ' + err);
//                                res.json(null);
//                            }
//                        });
//                    }
//                    else {
//                        res.statusCode = 401;
//                        res.json(null);
//                        console.log('FnSendBulkMailer: Invalid Token');
//                    }
//                } else {
//                    res.statusCode = 500;
//                    res.json(null);
//                    console.log('FnSendBulkMailer: Error in validating token:  ' + err);
//                }
//            });
//        }
//        else{
//            if (!Token) {
//                console.log('FnSendBulkMailer: Token is empty');
//            }
//            else if (!TID) {
//                console.log('FnSendBulkMailer: TID is empty');
//            }
//            else if (!TemplateID) {
//                console.log('FnSendBulkMailer: TemplateID is empty');
//            }
//        }
//
//    }
//    catch (ex) {
//        console.log('FnSendBulkMailer error:' + ex.description);
//        var errorDate = new Date();
//        console.log(errorDate.toTimeString() + ' ......... error ...........');
//    }
//};


/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get all enquiries
 * @param token <string> token of login user
 * @param filter  <string>
 *
 */
Procurement.prototype.procurementGetAllEnq = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if(!validationFlag){
        responseMessage.error = {token : 'Invalid Token'};
        responseMessage.message = 'Please check all the errors';
        res.status(401).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.query.token)+ ',' + st.db.escape(req.query.filter);
                        var procQuery = 'CALL pget_Allenquires(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'All Enquiry loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Enquiries are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Enquiries are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Enquiries are not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pget_Allenquires ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementGetAllEnq: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementGetAllEnq ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementGetAllEnq :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};
/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get enquiry Details
 * @param token <string> token of login user
 * @param enquiry_id  <INT>
 *
 */
Procurement.prototype.procurementGetEnqDetails = function(req,res,next){
    var eId = parseInt(req.query.enquiry_id);
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.query.enquiry_id)) || (parseInt(req.query.enquiry_id) <= 0)){
        error.vendor_id = 'Invalid enquiry id';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.query.enquiry_id);
                        var procQuery = 'CALL pget_enquiry_details(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {

                                            var output =[];
                                            for (var i = 0; i < results[1].length; i++) {
                                                var result = {};
                                                result.url = (results[1][i].a_url) ? results[1][i].a_url: '';
                                                result.fn = results[1][i].a_name;

                                                //result.proposal_document = (results[0][i].proposal_document) ?(results[0][i].proposal_document):
                                                //req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + results[0][i].proposal_document;
                                                output.push(result);
                                            }
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Purchase Transaction details loaded successfully';
                                            responseMessage.attachment=output;
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);

                                            //responseMessage.status = true;
                                            //responseMessage.error = null;
                                            //responseMessage.message = 'All details of Enquiry loaded successfully';
                                            //responseMessage.data = results[0];
                                            //res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Enquiry details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Enquiry details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Enquiry details are not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pget_enquiry_details ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('procurementGetEnqDetails: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementGetEnqDetails ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error procurementGetEnqDetails :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};


//Procurement.prototype.sendPoMail = function(req,res,next){
//    /**
//     * @todo SendMailer
//     */
//
//    try {
//
//        res.setHeader("Access-Control-Allow-Origin", "*");
//        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//
//        var Token = req.body.token;
//        var TemplateID = req.body.TemplateID;
//        var pro_att = req.body.poAttachment;
//        var vendor_id=req.body.vendor_id;
//        var po_temp = req.body.po_template;
//console.log(vendor_id,"vendor_id");
//        var toMailID ='';
//        var ccemailid = '';
//        var name='';
//        var fromEmail='';
//        var pro_ref='';
//        var pro_date='';
//        var vendor_cn='';
//        var logedinuser='';
//        //var pro_att='';
//
//
//        var RtnResponse = {
//            IsSent: false
//        };
//        //if (toMailID != null) {
//
//        if (Token && TemplateID ) {
//            st.validateToken(Token, function (err, tokenResult) {
//                if (!err) {
//                    if (tokenResult) {
//                        //var query = st.db.escape(Token) + ', ' +st.db.escape(TID);
//                        //var query = 'Select FirstName, LastName, CompanyName,ifnull(SalesMailID," ") as SalesMailID from tmaster where TID in (' + TID + ')';
//                        //console.log(GetResult[0]
//                        var procParams = st.db.escape(Token);
//                        var procQuery = 'CALL pSendMailerDetails(' + procParams + ')';
//                        st.db.query(procQuery, function (err, MailerDetailsResult) {
//                            if (!err) {
//                                console.log(MailerDetailsResult,"MailerDetailsResult");
//                                if (MailerDetailsResult) {
//                                    if (MailerDetailsResult.length > 0) {
//                                        var output = MailerDetailsResult[0];
//                                        name = output[0].Name;  //indivdual name business company name
//                                        logedinuser = output[0].logedinuser;
//                                        fromEmail = output[0].FromEmailId;
//                                        console.log(fromEmail,"from");
//                                    }
//                                }
//                            }
//                        });
//
//                        st.db.query('CALL pGet_proposaldetails(' + vendor_id + ')', function (err, vendordetails) {
//                            if (!err) {
//                                if (vendordetails) {
//                                    if (vendordetails.length > 0) {
//                                        var output = vendordetails[0];
//                                        pro_ref = output[0].pro_ref;
//                                        pro_date = output[0].pro_date;
//                                        vendor_cn= output[0].vendor_cn;
//                                        toMailID=output[0].vendor_emailid;
//                                        ccemailid=output[0].emailid;
//                                        //pro_att=output[0].pro_doc;
//                                        console.log(toMailID,"toMailID1");
//                                    }
//                                }
//                            }
//                        });
//                        console.log(pro_att,"pro_att");
//                        var templateQuery = 'Select * from mmailtemplate where TID = ' + st.db.escape(TemplateID);
//                        st.db.query(templateQuery, function (err, TemplateResult) {
//                            if (!err) {
//                                if (TemplateResult) {
//                                    if (TemplateResult.length > 0) {
//                                        // console.log(TemplateResult);
//                                        RtnResponse.IsSent = true;
//                                        for (var i = 0; i < TemplateResult.length; i++) {
//                                            var mailOptions = {
//                                                replyto: fromEmail,
//                                                to: toMailID,
//                                                cc:ccemailid,
//                                                subject: TemplateResult[0].Subject,
//                                                html: TemplateResult[0].Body // html body
//                                                //attachment: pro_att // html body
//                                            };
//                                            console.log(toMailID,"toMailID");
//                                            mailOptions.html = mailOptions.html.replace("[ContactName]", vendor_cn);
//                                            mailOptions.html = mailOptions.html.replace("[ProposalNumber]", pro_ref);
//                                            mailOptions.html = mailOptions.html.replace("[ProposalDate]", pro_date);
//                                            mailOptions.html = mailOptions.html.replace("[ClientName]", name);
//                                            mailOptions.html = mailOptions.html.replace("[LoginUserName]", logedinuser);
//
//console.log(mailOptions.to,"mailOptions.to");
//                                            var email = new sendgrid.Email();
//                                            email.from = mailOptions.replyto;
//                                            email.to = mailOptions.to;
//                                            email.cc=mailOptions.cc;
//                                            email.subject = mailOptions.subject;
//                                            email.html = mailOptions.html;
//                                            //email.files   = [{filename: 'proposal_document.jpg', content: data_proposal}],
//                                            email.addFile({
//                                                filename: pro_att,
//                                                url:  req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET +'/'+ pro_att
//                                        });
//                                            //email.addFile({
//                                            //    filename: '73d5a90d-1e7b-4373-a7ab-f9abcc26437f.txt',
//                                            //    url: 'https://storage.googleapis.com/ezeone/73d5a90d-1e7b-4373-a7ab-f9abcc26437f.txt'
//                                            //});
//
//                                            console.log(email.files);
//                                            console.log('send grid......');
//                                            console.log(email.to,"email.to");
//                                            sendgrid.send(email, function (err, result) {
//                                                console.log(err);
//                                                console.log(result,"result");
//                                                if (!err) {
//                                                    var post = {
//                                                        MessageType: 9,
//                                                        Priority: 5,
//                                                        ToMailID: mailOptions.to,
//                                                        Subject: mailOptions.subject,
//                                                        Body: mailOptions.html,
//                                                        Replyto: mailOptions.replyto,
//                                                        SentStatus: 1
//                                                    };
//
//                                                    console.log(post,"post");
//                                                    var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
//                                                        // Neat!
//                                                        if (!err) {
//                                                            console.log(result);
//                                                            console.log('FnSendBulkMailer: Mail saved Successfully');
//
//                                                            //CallBack(null, RtnMessage);
//                                                        }
//                                                        else {
//                                                            console.log('FnSendBulkMailer: Mail not Saved Successfully');
//                                                            // CallBack(null, null);
//                                                        }
//                                                    });
//                                                }
//                                                else {
//                                                    console.log('FnSendBulkMailer: Mail not send Successfully');
//                                                    // CallBack(null, null);
//                                                }
//                                            });
//                                            //console.log('FnSendBulkMailer:Mail details sent for processing');
//                                            //console.log(mailOptions);
//                                        }
//                                        res.send(RtnResponse);
//
//                                    }
//                                    else {
//                                        console.log('FnGetTemplateDetails:No Template Details found');
//                                        res.json(null);
//                                    }
//                                }
//                                else {
//                                    console.log('FnGetTemplateDetails:No Template Details found');
//                                    res.json(null);
//                                }
//                            }
//                            else {
//                                console.log('FnGetTemplateDetails:Error in getting template ' + err);
//                                res.json(null);
//                            }
//                        });
//                    }
//                    else {
//                        res.statusCode = 401;
//                        res.json(null);
//                        console.log('FnSendBulkMailer: Invalid Token');
//                    }
//                } else {
//                    res.statusCode = 500;
//                    res.json(null);
//                    console.log('FnSendBulkMailer: Error in validating token:  ' + err);
//                }
//            });
//        }
//        else{
//            if (!Token) {
//                console.log('FnSendBulkMailer: Token is empty');
//            }
//            else if (!TID) {
//                console.log('FnSendBulkMailer: TID is empty');
//            }
//            else if (!TemplateID) {
//                console.log('FnSendBulkMailer: TemplateID is empty');
//            }
//        }
//    }
//    catch (ex) {
//        console.log('FnSendBulkMailer error:' + ex.description);
//        var errorDate = new Date();
//        console.log(errorDate.toTimeString() + ' ......... error ...........');
//    }
//};

Procurement.prototype.sendPoMail = function(req,res,next){
    /**
     * @todo SendMailer
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.token;
        var TemplateID = req.body.TemplateID;
        var pro_att = req.body.poAttachment;
        var vendor_id=req.body.vendor_id;
        var po_temp = req.body.po_template;
        console.log(vendor_id,"vendor_id");
        var toMailID ='';
        var ccemailid = '';
        var name='';
        var fromEmail='';
        var pro_ref='';
        var pro_date='';
        var vendor_cn='';
        var logedinuser='';
        //var pro_att='';


        var RtnResponse = {
            IsSent: false
        };
        //if (toMailID != null) {

        if (Token && TemplateID ) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        //var query = st.db.escape(Token) + ', ' +st.db.escape(TID);
                        //var query = 'Select FirstName, LastName, CompanyName,ifnull(SalesMailID," ") as SalesMailID from tmaster where TID in (' + TID + ')';
                        //console.log(GetResult[0]
                        var procParams = st.db.escape(Token);
                        var procQuery = 'CALL pSendMailerDetails(' + procParams + ')';
                        st.db.query(procQuery, function (err, MailerDetailsResult) {
                            if (!err) {
                                console.log(MailerDetailsResult,"MailerDetailsResult");
                                if (MailerDetailsResult) {
                                    if (MailerDetailsResult.length > 0) {
                                        var output = MailerDetailsResult[0];
                                        name = output[0].Name;  //indivdual name business company name
                                        logedinuser = output[0].logedinuser;
                                        fromEmail = output[0].FromEmailId;
                                        console.log(fromEmail,"from");
                                    }
                                    st.db.query('CALL pGet_proposaldetails(' + vendor_id + ')', function (err, vendordetails) {
                                        if (!err) {
                                            if (vendordetails) {
                                                if (vendordetails.length > 0) {
                                                    var output = vendordetails[0];
                                                    pro_ref = output[0].pro_ref;
                                                    pro_date = output[0].pro_date;
                                                    vendor_cn= output[0].vendor_cn;
                                                    if(!output[0].vendor_emailid){
                                                    output[0].vendor_emailid=output[0].emailid;
                                                    output[0].emailid='';
                                                    }
                                                    toMailID=output[0].vendor_emailid;
                                                    ccemailid=output[0].emailid;
                                                    //pro_att=output[0].pro_doc;
                                                    //console.log(toMailID,"toMailID1");
                                                    //console.log(pro_att,"pro_att");
                                                    var templateQuery = 'Select * from mmailtemplate where TID = ' + st.db.escape(TemplateID);
                                                    st.db.query(templateQuery, function (err, TemplateResult) {
                                                        if (!err) {
                                                            if (TemplateResult) {
                                                                if (TemplateResult.length > 0) {
                                                                    // console.log(TemplateResult);
                                                                    RtnResponse.IsSent = true;
                                                                    for (var i = 0; i < TemplateResult.length; i++) {
                                                                        var mailOptions = {
                                                                            replyto: fromEmail,
                                                                            to: toMailID,
                                                                            cc:ccemailid,
                                                                            subject: TemplateResult[0].Subject,
                                                                            html: TemplateResult[0].Body // html body
                                                                            //attachment: pro_att // html body
                                                                        };
                                                                        console.log(toMailID,"toMailID");
                                                                        mailOptions.html = mailOptions.html.replace("[ContactName]", vendor_cn);
                                                                        mailOptions.html = mailOptions.html.replace("[ProposalNumber]", pro_ref);
                                                                        mailOptions.html = mailOptions.html.replace("[ProposalDate]", pro_date);
                                                                        mailOptions.html = mailOptions.html.replace("[ClientName]", name);
                                                                        mailOptions.html = mailOptions.html.replace("[LoginUserName]", logedinuser);

                                                                        console.log(mailOptions.to,"mailOptions.to");
                                                                        var email = new sendgrid.Email();
                                                                        email.from = mailOptions.replyto;
                                                                        email.to = mailOptions.to;
                                                                        email.cc=mailOptions.cc;
                                                                        email.subject = mailOptions.subject;
                                                                        email.html = mailOptions.html;
                                                                        //email.files   = [{filename: 'proposal_document.jpg', content: data_proposal}],
                                                                        email.addFile({
                                                                            filename: pro_att,
                                                                            url:  req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET +'/'+ pro_att
                                                                        });
                                                                        //email.addFile({
                                                                        //    filename: '73d5a90d-1e7b-4373-a7ab-f9abcc26437f.txt',
                                                                        //    url: 'https://storage.googleapis.com/ezeone/73d5a90d-1e7b-4373-a7ab-f9abcc26437f.txt'
                                                                        //});

                                                                        console.log(email.files);
                                                                        console.log('send grid......');
                                                                        console.log(email.to,"email.to");
                                                                        sendgrid.send(email, function (err, result) {
                                                                            console.log(err);
                                                                            console.log(result,"result");
                                                                            if (!err) {
                                                                                var post = {
                                                                                    MessageType: 9,
                                                                                    Priority: 5,
                                                                                    ToMailID: mailOptions.to,
                                                                                    Subject: mailOptions.subject,
                                                                                    Body: mailOptions.html,
                                                                                    Replyto: mailOptions.replyto,
                                                                                    SentStatus: 1
                                                                                };

                                                                                console.log(post,"post");
                                                                                var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                                                    // Neat!
                                                                                    if (!err) {
                                                                                        console.log(result);
                                                                                        console.log('sendPoMail: Mail saved Successfully');

                                                                                        //CallBack(null, RtnMessage);
                                                                                    }
                                                                                    else {
                                                                                        console.log('sendPoMail: Mail not Saved Successfully');
                                                                                        // CallBack(null, null);
                                                                                    }
                                                                                });
                                                                            }
                                                                            else {
                                                                                console.log('sendPoMail: Mail not send Successfully');
                                                                                // CallBack(null, null);
                                                                            }
                                                                        });
                                                                        //console.log('FnSendBulkMailer:Mail details sent for processing');
                                                                        //console.log(mailOptions);
                                                                    }
                                                                    res.send(RtnResponse);

                                                                }
                                                                else {
                                                                    console.log('FnGetTemplateDetails:No Template Details found');
                                                                    res.json(null);
                                                                }
                                                            }
                                                            else {
                                                                console.log('FnGetTemplateDetails:No Template Details found');
                                                                res.json(null);
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnGetTemplateDetails:Error in getting template ' + err);
                                                            res.json(null);
                                                        }
                                                    });

                                                }
                                            }
                                        }
                                    });

                                }
                            }
                        });


                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('sendPoMail: Invalid Token');
                    }
                } else {
                    res.statusCode = 500;
                    res.json(null);
                    console.log('sendPoMail: Error in validating token:  ' + err);
                }
            });
        }
        else{
            if (!Token) {
                console.log('sendPoMail: Token is empty');
            }
            //else if (!TID) {
            //    console.log('sendPoMail: TID is empty');
            //}
            else if (!TemplateID) {
                console.log('sendPoMail: TemplateID is empty');
            }
        }
    }
    catch (ex) {
        console.log('sendPoMail error:' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

Procurement.prototype.testPdf = function(req,res,next){

    var pdfDocument = require('pdfkit');
    //var doc = new pdfDocument();
    var doc = new pdfDocument({
        size: 'A1',
        layout: 'portrait'
    });
    var po_temp = '<p> TO: 111  <span>2016-02-13 01:06:56</span><br/></p><p>vim pvt ltd<br/></p><p>19th C Cross,Stage 2, NS Palya, , BTM 2nd Stage,Bengaluru,Karnataka,India,560076<br/></p><p>Subject: Purchaser order with reference to your proposal number 44444 dated 2016-02-13 01:06:56<br/></p><p><br/></p><p>Dear abhi<br/></p><p>With reference to your proposal number 44444 dated 2016-02-13 01:06:56, we are pleased to place order for the same as per the following item details, terms and conditions.<br/></p><p><br/></p><p><b><u>Order Details</u></b><br/></p><p>Item details to be types or copied from Vendor Proposal.<br/></p><p><br/></p><p>For GS Group<br/></p><p><a href="https://www.ezeone.com/" target="">https://www.ezeone.com/</a><br/></p><p>Authorised Signatory<br/></p>';
    var bufferData = new Buffer(po_temp,'utf8');
    console.log(bufferData);
    //var pdfdoc = doc.html(bufferData);
    console.log(bufferData);

    var ws = fs.createWriteStream('./TempMapLocationFile/'+'bhavya'+'.pdf');
    console.log(ws);
    var stream = doc.pipe(ws);
    doc.end();

    doc.on('end',function(){
        stream.end();
    });

    stream.on('end',function(){
        stream.close();
    });

    stream.on('close',function(){
        fs.exists('./TempMapLocationFile/'+'bhavya'+'.pdf', function (exists) {

            if (exists) {
                var bufferPdfDoc = fs.readFileSync('./TempMapLocationFile/' + 'bhavya' + '.pdf');
                console.log(bufferPdfDoc);
                // convert binary data to base64 encoded string
                var Base64PdfData = new Buffer(bufferPdfDoc).toString('base64');
                //console.log(Base64PdfData);
                //fs.writeFileSync('base64.txt', Base64PdfData);
                //fs.unlinkSync('TempMapLocationFile/' + OutputFileName + '.pdf');
                var file = 'TempMapLocationFile/' + 'bhavya' + '.pdf';
                console.log('successfully deleted TempMapLocationFile/' + 'bhavya' + '.pdf');

                var mailOptions = {
                    from: 'noreply@ezeone.com',
                    to: ToMailID,
                    subject: 'Route Map',
                    html: data, // html body
                    Attachment: Base64PdfData,
                    AttachmentFileName: 'bhavya' + '.pdf'
                };
            }
        });
    });
};


module.exports = Procurement;