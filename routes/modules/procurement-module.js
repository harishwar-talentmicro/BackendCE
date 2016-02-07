/**
 *  @author Bhavya  Jain
 *  @since Feb 06,2016  10:46AM
 *  @title Procurement module
 *  @description Handles procurement  functions
 */
"use strict";

var util = require('util');
var validator = require('validator');



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
module.exports = Procurement;