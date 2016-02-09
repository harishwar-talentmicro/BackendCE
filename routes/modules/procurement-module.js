/**
 *  @author Bhavya  Jain
 *  @since Feb 06,2016  10:46AM
 *  @title Procurement module
 *  @description Handles procurement  functions
 */
"use strict";

var util = require('util');
var validator = require('validator');
var chalk = require('chalk');


var st = null;
function Procurement(db,stdLib){

    if(stdLib){
        st = stdLib;

    }
};

Procurement.prototype.procurementSubmitEnquiry = function(req,res,next){
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
    if (req.body.id){
        if (isNaN(req.body.id)) {
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
                            st.db.escape(req.body.notes) + ',' + st.db.escape(req.body.id);
                        var procQuery = 'CALL psubmit_enquiry(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            if (results[0][0].id){
                                                for (var i = 0; i < results[0][0].id.length; i++) {
                                                    if (results[0][0].id) {
                                                        var procParams = st.db.escape(req.body.token)
                                                            + ',' + st.db.escape(results[0][0].id) + ',' + st.db.escape(req.body.ezeoneid)
                                                            + ',' + st.db.escape(req.body.vn) + ',' + st.db.escape(req.body.cn) + ',' +
                                                            st.db.escape(req.body.phone) + ',' + st.db.escape(req.body.email)+ ',' +
                                                            st.db.escape(req.body.vid);
                                                        var procQuery = 'CALL psave_enquiry_vendors(' + procParams + ')';
                                                        console.log(procQuery);
                                                        st.db.query(procQuery, function (err, results) {
                                                            if (!err) {
                                                                console.log(results);
                                                                if (results) {
                                                                    if (results[0]) {
                                                                        if (results[0][0]) {
                                                                            if (results[0][0].id){
                                                                                responseMessage.status = true;
                                                                                responseMessage.error = null;
                                                                                responseMessage.message = 'enquiry vendors added successfully';
                                                                                responseMessage.data = {
                                                                                    id : results[0][0].id
                                                                                };
                                                                                res.status(200).json(responseMessage);
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
                                                    else{
                                                        responseMessage.status = false;
                                                        responseMessage.error = null;
                                                        responseMessage.message = 'Invalid id of enquiry vendor';
                                                        responseMessage.data = null;
                                                        res.status(400).json(responseMessage);
                                                    }
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
 * @description save salary template
 * @accepts json
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
    if (!validator.isLength((req.body.a1), 3,50)) {
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

    }
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
                                responseMessage.data = null;
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
 * @accepts json
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
 * @accepts json
 * @param token <string> token of login user
 * @param id <int> vendor id
 *
 */
Procurement.prototype.procurementDelVendor = function(req,res,next){
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
    if (isNaN(req.params.id) || (req.params.id <= 0)){
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
                        var procParams = st.db.escape(req.params.id);
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
 * @description get Vendor
 * @accepts json
 * @param token <string> token of login user
 * @param eid <int>  enquiry id
 *
 */
Procurement.prototype.procurementGetEnqAttchment = function(req,res,next){
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
    if (isNaN(req.query.eid) || (req.query.eid <= 0)){
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
                        var procParams =  st.db.escape(req.query.eid);
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
 * @description DELETE vendor
 * @accepts json
 * @param token <string> token of login user
 * @param id <int> enquiry attachment id
 *
 */
Procurement.prototype.procurementDelEnqAttachment = function(req,res,next){
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
    if (isNaN(req.params.id) || (req.params.id <= 0)){
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
                        var procParams = st.db.escape(req.params.id);
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
 * @description get Vendor
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
                                            responseMessage.data = results[0];
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
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description save salary template
 * @accepts json
 * @param token <string> token of login user
 * @param temp_id <int> id is template id
 * @param title <string> title of template
 * @param editortext <string> editor text
 *
 */
Procurement.prototype.procurementSavePoTemplate = function(req,res,next){
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
    if (req.body.temp_id){
        if (isNaN(req.body.temp_id)) {
            error.temp_id = 'Invalid id of Salary Header';
            validationFlag *= false;
        }
    }
    else {
        req.body.temp_id = 0;
    }
    if (!validator.isLength((req.body.title), 2, 150)) {
        error.title = 'Title should be atleast 2 character';
        validationFlag *= false;
    }
    console.log(req.body.editortext);
    if(!req.body.editortext){
        error.editortext = 'Invalid Editortext';
        validationFlag *= false;
        console.log("test");
    }
    else {
        try {
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.temp_id)
                            + ',' + st.db.escape(req.body.title)+ ',' + st.db.escape(req.body.editortext);
                        var procQuery = 'CALL psave_POtemplate(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
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
 * @description get Vendor
 * @accepts json
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
 * @description DELETE vendor
 * @accepts json
 * @param token <string> token of login user
 * @param id <int>
 *
 */
Procurement.prototype.procurementDelPoTemplate = function(req,res,next){
    chalk.blue('Hello') + 'World' + chalk.red('!');
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
    if (isNaN(req.params.id) || (req.params.id <= 0)){
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
                        var procParams = st.db.escape(req.query.token)+ ',' + st.db.escape(req.params.id);
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
 * @description save salary template
 * @accepts json
 * @param token <string> token of login user
 * @param vendor_id <int> vendor id
 * @param po_nu <string> purchase order number
 * @param po_date <Datetime> purchase order datetime
 * @param po_order <text> purchase order attachment
 *
 */
Procurement.prototype.procurementSavePoDetails = function(req,res,next){
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
    if (!req.body.vendor_id){
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
    else {
        try {
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.vendor_id)
                            + ',' + st.db.escape(req.body.po_nu)+ ',' + st.db.escape(req.body.po_date)
                            + ',' + st.db.escape(req.body.po_order);
                        var procQuery = 'CALL psave_POdetails(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Purchase order details added successfully';
                                responseMessage.data = null;
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
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @server_param
 * @description Approve Alumni members
 */
Procurement.prototype.procurementUpdateProposalDetails = function(req,res,next) {

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
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
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

module.exports = Procurement;