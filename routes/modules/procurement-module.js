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

var chalk = require('chalk');
var st = null;
function Procurement(db,stdLib){

    if(stdLib){

        st = stdLib;
    }

};
Procurement.prototype.procurementSubmitEnquiry = function(req,res,next){
    var id = parseInt(req.params.id);
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
    if (id){
        if (isNaN(id)) {
            error.id = 'Invalid id of enquiry';
            validationFlag *= false;
        }
    }
    else {
        req.body.id = 0;
    }
    if (!validator.isLength((req.body.title), 2, 100)) {
        error.title = 'Title should be atleast 2 character';
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
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.title) + ',' + st.db.escape(req.body.refno)
                            + ',' + st.db.escape(req.body.dd) + ',' + st.db.escape(req.body.details)+ ',' + st.db.escape(req.body.cezeone)+ ',' +
                            st.db.escape(req.body.notes) + ',' + st.db.escape(id);
                        var procQuery = 'CALL psubmit_enquiry(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            if (results[0][0].id){
                                                var eId = results[0][0].id
                                                var vArray = []
                                                vArray.push(results[0][0].vendorArray);
                                                var subCount = 0;
                                                var emailCount = 0;
                                                var nSentCount = 0 ;
                                                for (var i = 0; i < vArray.length; i++) {
                                                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(eId)
                                                            + ',' + st.db.escape(vArray[0][i].vezeoneid) + ',' + st.db.escape(vArray[0][i].vn)
                                                            + ',' + st.db.escape(vArray[0][i].cn) + ',' + st.db.escape(vArray[0][i].phone_no)
                                                            + ',' + st.db.escape(vArray[0][i].email) + ',' + st.db.escape(vArray[0][i].vid);

                                                        var procQuery = 'CALL psave_enquiry_vendors(' + procParams + ')';
                                                        console.log(procQuery);
                                                        st.db.query(procQuery, function (err, results) {
                                                            if (!err) {
                                                                console.log(results);
                                                                if (results) {
                                                                    if (results[0]) {
                                                                        if (results[0][0]) {
                                                                            if (vArray[0][i].vezeoneid !=''){
                                                                                var procParams = st.db.escape(req.body.token)
                                                                                    + ',' + st.db.escape(vArray[0][i].vezeoneid) + ',' + st.db.escape(vArray[0][i].vn)
                                                                                    + ',' + st.db.escape(vArray[0][i].cn) + ',' + st.db.escape(req.body.msg) + ',' +
                                                                                    st.db.escape(req.body.notes) + ',' + st.db.escape(results[0][0].id);

                                                                                var procQuery = 'CALL psend_Procurement_enquiry(' + procParams + ')';
                                                                                console.log(procQuery);
                                                                                st.db.query(procQuery, function (err, results) {
                                                                                    if (!err) {
                                                                                        if(results.message != "already submitted"){
                                                                                           subCount = subCount+1;
                                                                                        }

                                                                                        console.log(results);
                                                                                        responseMessage.status = true;
                                                                                        responseMessage.error = null;
                                                                                        responseMessage.message = 'Procurement enquiry sent successfully';
                                                                                        responseMessage.data = results;
                                                                                        res.status(200).json(responseMessage);
                                                                                    }
                                                                                    else {
                                                                                        responseMessage.error = {
                                                                                            server: 'Internal Server Error'
                                                                                        };
                                                                                        responseMessage.message = 'An error occurred !';
                                                                                        res.status(500).json(responseMessage);
                                                                                        console.log('Error : psend_Procurement_enquiry ',err);
                                                                                        var errorDate = new Date();
                                                                                        console.log(errorDate.toTimeString() + ' ......... error ...........');
                                                                                    }
                                                                                });

                                                                                responseMessage.status = true;
                                                                                responseMessage.error = null;
                                                                                responseMessage.message = 'enquiry vendors added successfully';
                                                                                responseMessage.data = {
                                                                                    id : results[0][0].id
                                                                                };
                                                                                res.status(200).json(responseMessage);
                                                                            }
                                                                            else if(vArray[0][i].email !='') {

                                                                                emailCount = emailCount+1;
                                                                                responseMessage.status = true;
                                                                                responseMessage.error = null;
                                                                                responseMessage.message = 'mail sent successfully';
                                                                                responseMessage.data = null;
                                                                                res.status(200).json(responseMessage);
                                                                            }
                                                                            else{
                                                                               nSentCount = nSentCount+1;
                                                                            }
                                                                        }
                                                                        else {
                                                                            responseMessage.status = false;
                                                                            responseMessage.error = null;
                                                                            responseMessage.message = 'Error in adding enquiry vendors';
                                                                            responseMessage.data = null;
                                                                            res.status(200).json(responseMessage);
                                                                        }
                                                                    }
                                                                    else {
                                                                        responseMessage.status = false;
                                                                        responseMessage.error = null;
                                                                        responseMessage.message = 'Error in adding enquiry vendors';
                                                                        responseMessage.data = null;
                                                                        res.status(200).json(responseMessage);
                                                                    }

                                                                }
                                                                else {
                                                                    responseMessage.status = false;
                                                                    responseMessage.error = null;
                                                                    responseMessage.message = 'Error in adding enquiry vendors';
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
                                                                console.log('Error : psave_enquiry_vendors ',err);
                                                                var errorDate = new Date();
                                                                console.log(errorDate.toTimeString() + ' ......... error ...........');
                                                            }
                                                        });

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
                                console.log('Error : psubmit_enquiry ',err);
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
                        console.log('psubmit_enquiry: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : psubmit_enquiry ',err);
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
            console.log('Error psubmit_enquiry :  ',ex);
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
                                responseMessage.data = req.body;
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
                                                //result.proposal_document = (results[0][i].proposal_document) ?(results[0][i].proposal_document):
                                                //req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + results[0][i].proposal_document;
                                                output.push(result);
                                            }

                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Purchase Transaction details loaded successfully';
                                            responseMessage.data=output;
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
    console.log(momentObj,"date");
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
                            + ',' + st.db.escape(req.body.pro_ref)+ ',' + st.db.escape(req.body.pro_date)
                            + ',' + st.db.escape(req.body.pro_amount)+ ',' + st.db.escape(proDate)
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


Procurement.prototype.hrisSaveSalaryTpl = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    if(req.is('json')) {
        var validationFlag = true;
        var error = {};
        if (!req.body.eid) {
            error.eid = 'Invalid template details';
            validationFlag *= false;
        }
        if (!req.body.url) {
            error.url = 'Invalid token';
            validationFlag *= false;
        }
        if (!req.body.fn) {
            error.fn = 'Invalid title';
            validationFlag *= false;
        }
        if (req.body.id) {
            if (isNaN(parseInt(req.body.id))) {
                error.id = 'Invalid id of template';
                validationFlag *= false;
            }
            if (parseInt(req.body.id) < 0) {
                error.id = 'Invalid id of template';
                validationFlag *= false;
            }
        }
        else {
            req.body.id = 0;
        }

        var salaryHeadArray = [];
        if(req.body.s_head){
            if(util.isArray(req.body.s_head)){
                if(req.body.s_head.length){
                    for(var count = 0; count < req.body.s_head.length; count++){
                        if(typeof(req.body.s_head[count])  == 'object'){
                            console.log('Cond : ',!(isFinite(parseInt(req.body.s_head[count].sid)) && parseInt(req.body.s_head[count].sid) > 0));
                            if(!(isFinite(parseInt(req.body.s_head[count].sid)) && parseInt(req.body.s_head[count].sid) > 0)){
                                continue;
                            }
                            if(!(isFinite(parseInt(req.body.s_head[count].seq)) && parseInt(req.body.s_head[count].seq) > 0)){
                                req.body.s_head[count].seq = 0;
                            }
                            if(!(isFinite(parseInt(req.body.s_head[count].sal_type)) && parseInt(req.body.s_head[count].sal_type) > 0)){
                                /**
                                 * Default salary type is 3 (if not defined) i.e. per annum
                                 * @type {number}
                                 */
                                req.body.s_head[count].sal_type = 3;
                            }
                            salaryHeadArray.push(req.body.s_head[count]);
                        }
                        else{
                            console.log('missed');
                            continue;
                        }

                    }
                }

            }
            else{
                error.s_head = 'Invalid list of salary_head template';
                validationFlag *= false;
            }
        }

        console.log('salaryHeadArray',salaryHeadArray);

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
                            var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.id) + ',' + st.db.escape(req.body.title);
                            var procQuery = 'CALL psave_salary_template(' + procParams + ')';
                            console.log(procQuery);
                            st.db.query(procQuery, function (err, salaryTplResult) {
                                if (!err) {
                                    console.log(salaryTplResult);
                                    if (salaryTplResult) {
                                        if (salaryTplResult[0]) {
                                            if (salaryTplResult[0][0]) {
                                                if (salaryTplResult[0][0].id) {
                                                    var comSaveTplDetailsQuery = "";

                                                    /**
                                                     * Saving salary array head list to database
                                                     * Note: Procedure is written in such a way if any attribute changes
                                                     * then it updates else it adds up (create a new entry) the salary head details to salary template
                                                     */
                                                    var saveSalaryHeadArrayFn = function(deleteArray){
                                                        if(salaryHeadArray.length){

                                                            for(var i = 0; i < salaryHeadArray.length; i++){
                                                                var saveTplDetailsQuery = "CALL psave_salary_template_details("+
                                                                    st.db.escape(salaryTplResult[0][0].id) + ','+
                                                                    st.db.escape(salaryHeadArray[i].sid) +','+
                                                                    st.db.escape(salaryHeadArray[i].seq) +','+
                                                                    st.db.escape(parseInt(salaryHeadArray[i].sal_type))
                                                                    + ");";
                                                                comSaveTplDetailsQuery += saveTplDetailsQuery;
                                                            }

                                                            if(deleteArray){
                                                                if(deleteArray.length){
                                                                    for(var i = 0; i < salaryHeadArray.length; i++){
                                                                        var deleteTplDetailsQuery = "CALL pdelete_salary_template_details("+
                                                                            st.db.escape(salaryTplResult[0][0].id) + ','+
                                                                            st.db.escape(deleteArray[i].sid) +','+
                                                                            st.db.escape(deleteArray[i].seq)
                                                                            + ");";
                                                                        comSaveTplDetailsQuery += deleteTplDetailsQuery;
                                                                    }
                                                                }
                                                            }

                                                            console.log('comSaveTplDetailsQuery',comSaveTplDetailsQuery);

                                                            st.db.query(comSaveTplDetailsQuery, function (err, tplDetailsResult) {
                                                                if (!err) {
                                                                    if(tplDetailsResult){
                                                                        console.log(tplDetailsResult);
                                                                        responseMessage.status = true;
                                                                        responseMessage.error = null;
                                                                        responseMessage.message = "Salary template saved successfully";
                                                                        responseMessage.data = {
                                                                            id : salaryTplResult[0][0].id,
                                                                            title : req.body.title,
                                                                            s_head : salaryHeadArray
                                                                        };
                                                                        res.status(200).json(responseMessage);
                                                                    }
                                                                    else{
                                                                        responseMessage.data = null;
                                                                        console.log('Data not loaded for psave_salary_template_details');
                                                                        res.status(500).json(responseMessage);
                                                                    }
                                                                }
                                                                else{
                                                                    responseMessage.error = {
                                                                        server: 'Internal Server Error'
                                                                    };
                                                                    responseMessage.message = 'An error occurred !';
                                                                    res.status(500).json(responseMessage);
                                                                    console.log('Error : hrisSaveSalaryTemplate ', err);
                                                                    var errorDate = new Date();
                                                                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                                                                }
                                                            });

                                                        }
                                                        else{
                                                            responseMessage.status = true;
                                                            responseMessage.error = null;
                                                            responseMessage.message = "Salary template saved successfully";
                                                            responseMessage.data = {
                                                                id : salaryTplResult[0][0].id,
                                                                title : req.body.title,
                                                                s_head : []
                                                            };
                                                            res.status(200).json(responseMessage);
                                                        }
                                                    };

                                                    /**
                                                     * If user is changing salary template, then firtly we have to compare the
                                                     * salary heads by loading the data and then finding out what to add and what to delete
                                                     * in salary head list, therefore an extra procedure is required to fetch up the previously
                                                     * saved data from db
                                                     */
                                                    if(req.body.id == salaryTplResult[0][0].id){
                                                        var tplPrevDetailsQuery = "CALL pget_salary_template_details("+
                                                            st.db.escape(salaryTplResult[0][0].id) + ")";

                                                        st.db.query(tplPrevDetailsQuery, function (err, tplPrevDetailsResult) {
                                                            if (!err) {
                                                                if(tplPrevDetailsResult){
                                                                    if(tplPrevDetailsResult[0]){
                                                                        if(tplPrevDetailsResult[0][0]){
                                                                            if(tplPrevDetailsResult[1]){
                                                                                if(tplPrevDetailsResult[1].length){

                                                                                    /**
                                                                                     * Salary head list which has to be deleted
                                                                                     */
                                                                                    var deleteArray = [];
                                                                                    /**
                                                                                     * Comparing two array and finding out what to delete
                                                                                     */
                                                                                    for(var i =0; i < tplPrevDetailsResult[1].length; i++){
                                                                                        var salaryHeadFound = false;
                                                                                        for(var j = 0; j < salaryHeadArray.length; j++){
                                                                                            if(salaryHeadArray[i].sid == tplPrevDetailsResult[1][j].sid){
                                                                                                salaryHeadFound = true;
                                                                                                break;
                                                                                            }
                                                                                        }
                                                                                        if(!salaryHeadFound){
                                                                                            deleteArray.push(tplPrevDetailsResult[1][j]);
                                                                                        }
                                                                                    }

                                                                                    console.log(deleteArray);
                                                                                    saveSalaryHeadArrayFn(deleteArray);
                                                                                }
                                                                                else{
                                                                                    saveSalaryHeadArrayFn();
                                                                                }
                                                                            }
                                                                            else{
                                                                                saveSalaryHeadArrayFn();

                                                                            }
                                                                        }
                                                                        else{
                                                                            responseMessage.status = false;
                                                                            responseMessage.error = {
                                                                                id: 'Salary template not found'
                                                                            };
                                                                            responseMessage.message = 'Salary Template not found !';
                                                                            res.status(200).json(responseMessage);
                                                                        }
                                                                    }
                                                                    else{
                                                                        responseMessage.status = false;
                                                                        responseMessage.error = {
                                                                            id: 'Salary template not found'
                                                                        };
                                                                        responseMessage.message = 'Salary Template not found !';
                                                                        res.status(200).json(responseMessage);
                                                                    }
                                                                }
                                                                else{
                                                                    responseMessage.status = false;
                                                                    responseMessage.error = {
                                                                        id: 'Salary template not found'
                                                                    };
                                                                    responseMessage.message = 'Salary Template not found !';
                                                                    res.status(200).json(responseMessage);
                                                                }
                                                            }
                                                            else{
                                                                responseMessage.error = {
                                                                    server: 'Internal Server Error'
                                                                };
                                                                responseMessage.message = 'An error occurred !';
                                                                res.status(500).json(responseMessage);
                                                                console.log('Error : hrisSaveSalaryTemplate ', err);
                                                                var errorDate = new Date();
                                                                console.log(errorDate.toTimeString() + ' ......... error ...........');
                                                            }
                                                        });
                                                    }

                                                    /**
                                                     * In case user is creating a new salary template then
                                                     * we don't have to load the previous salary heads and we can directly insert
                                                     * the salary head list into db
                                                     */
                                                    else {
                                                        saveSalaryHeadArrayFn();
                                                    }


                                                }
                                                else {
                                                    responseMessage.status = false;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'Error in adding Salary template details';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in adding Salary template details';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in adding Salary template details';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }

                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in adding Salary template details';
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
                                    console.log('Error : hrisSaveSalaryTemplate ', err);
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
                            console.log('hrisSaveSalaryTemplate: Invalid token');
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'An error occurred !';
                        res.status(500).json(responseMessage);
                        console.log('Error : hrisSaveSalaryTemplate ', err);
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
                console.log('Error hrisSaveSalaryTemplate :  ', ex);
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
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get proposal details
 * @param token <string> token of login user
 * @param vendor_id <int> vendor id
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
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(vId) || (vId <= 0)){
        error.vendor_id = 'Invalid vendor id';
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
                                console.log('Error : pload_purchasetrans_details ',err);
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
                        console.log('procurementLoadTransDetails: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : procurementLoadTransDetails ',err);
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
            console.log('Error procurementLoadTransDetails :  ',ex);
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
    if (isNaN(vId) || (vId <= 0)){
        error.vendor_id = 'Invalid vendor id';
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

module.exports = Procurement;