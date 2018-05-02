/**
 *  @author Anjali Pandya
 *  @since Feb 26,2016  12:55PM
 *  @title Profile branch module
 *  @description Handles Profile branch functions
 */
"use strict";

var util = require('util');
var validator = require('validator');

var appConfig = require('../../ezeone-config.json');
var DBSecretKey=appConfig.DB.secretKey;


var st = null;
function ProfileBranch(db,stdLib){

    if(stdLib){
        st = stdLib;

    }
};

/**
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description create and update branch
 * @accepts json
 *
 * @param token <string> token of login user
 * @param id <int>  id=0 for new branch else id of branch
 * @param ezeoneid  <string>  ezeone id of brach ex: @HIRECRAFT_HSR
 * @param address  <string>  address of branch
 * @param cn  <string> company name
 * @param lat  <string> lattitude
 * @param long  <string> longitude
 * @param hcalid <int>  holiday calender id
 * @param email <string> email
 * @param phone <string>  phone number
 * @param ws <string> websitel
 * @param ISDPhone <string> Phone ISD Code
 * @param parking_status <int> parking status
 *
 */
ProfileBranch.prototype.saveBranch = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    req.body.id = (!isNaN(parseInt(req.body.id))) ? parseInt(req.body.id) : 0;
    req.body.cn = (req.body.cn) ? req.body.cn : '';
    req.body.email = (validator.isEmail(req.body.email)) ? req.body.email : '';
    req.body.hcalid = (!isNaN(parseInt(req.body.hcalid))) ? parseInt(req.body.hcalid) : 0;
    req.body.phone = (req.body.phone) ? req.body.phone : '';
    req.body.ws = (req.body.ws) ? req.body.ws : '';
    req.body.parking_status = (req.body.parking_status) ? (req.body.parking_status) : 0 ;

    if(!req.body.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if(!req.body.ezeoneid){
        error.ezeoneid = 'Invalid EZEID';
        validationFlag *= false;
    }
    if(!req.body.cn){
        error.cn = 'Invalid Company Name';
        validationFlag *= false;
    }
    if(!req.body.ISDPhone){
        req.body.ISDPhone = "";
    }
    if((!req.body.lat) && (!req.body.long)){
        error.lat = 'Invalid latitude or longitute';
        validationFlag *= false;
    }
    if (!validator.isLength(req.body.address, 3, 250)) {
        error.address = 'Address can be maximum 250 characters';
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
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.id) + ',' + st.db.escape(req.body.ezeoneid)
                            + ',' + st.db.escape(req.body.address) + ',' + st.db.escape(req.body.cn) + ',' + st.db.escape(req.body.lat)
                            + ',' + st.db.escape(req.body.long) + ',' + st.db.escape(req.body.hcalid) + ',' + st.db.escape(req.body.phone)
                            + ',' + st.db.escape(req.body.email) + ',' + st.db.escape(req.body.ws) + ',' + st.db.escape(req.body.ISDPhone)
                            + ',' + st.db.escape(req.body.parking_status);
                        var procQuery = 'CALL psaveBranches(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            console.log ('Branchlist result ', results[0][0]);
                                            if (results[0][0].id){
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Branch added successfully';
                                                responseMessage.data = {
                                                    id : results[0][0].id,
                                                    hcalid : (results[0][0].hcalid) ? results[0][0].hcalid : 0 // Holdiay calendar template ID
                                                };
                                                res.status(200).json(responseMessage);
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Branch already exists';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Branch already exists';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Branch already exists';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }

                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Branch already exists';
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
                                console.log('Error : psaveBranches ',err);
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
                        console.log('saveBranch: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : saveBranch ',err);
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
            console.log('Error saveBranch :  ',ex);
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
 * @description DELETE salary head
 * @accepts json
 * @param token <string> token of login user
 * @param id <int> branch id
 *
 */
ProfileBranch.prototype.deleteBranch = function(req,res,next){
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
    if (isNaN(parseInt(req.params.id)) || (req.params.id <= 0)){
        error.id = 'Invalid id of branch';
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
                        var procQuery = 'CALL pdeletebranch(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Branch is deleted';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in deleting branch';
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
                                console.log('Error : pdeletebranch ',err);
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
                        console.log('hrisGetSalaryTempDetails: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : deleteBranch ',err);
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
            console.log('Error deleteBranch :  ',ex);
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
 * @description get branch
 * @accepts json
 * @param token <string> token of login user
 *
 */
ProfileBranch.prototype.getBranch = function(req,res,next){
    req.query.ezeid = (req.query.ezeid) ? req.st.alterEzeoneId(req.query.ezeid) : ''

    if(!req.query.ezeid){
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
                            var procParams = st.db.escape(req.query.token)+','+st.db.escape(DBSecretKey);
                            var procQuery = 'CALL pgetbranches(' + procParams + ')';
                            console.log(procQuery);
                            st.db.query(procQuery, function (err, results) {
                                if (!err) {
                                    console.log(results);
                                    if (results) {
                                        if (results[0]) {
                                            if (results[0].length > 0) {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Branch loaded successfully';
                                                responseMessage.data = results[0];
                                                res.status(200).json(responseMessage);
                                            }
                                            else {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Branch is not available';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Branch is not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }

                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Branch is not available';
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
                                    console.log('Error : pgetbranches ',err);
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
                            console.log('getBranch: Invalid token');
                        }
                    }
                    else{
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'An error occurred !';
                        res.status(500).json(responseMessage);
                        console.log('Error : getBranch ',err);
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
                console.log('Error getBranch :  ',ex);
                var errorDate = new Date();
                console.log(errorDate.toTimeString() + ' ......... error ...........');
            }
        }

    }
    else{
        var responseMessage = {
            status: false,
            error: {},
            message: '',
            data: null
        };
        var validationFlag = true;

        req.query.ezeid = (req.query.ezeid) ? req.st.alterEzeoneId(req.query.ezeid) : ''

        var error = {};




        if (!validationFlag) {
            responseMessage.error = error;
            responseMessage.message = 'Please check the errors';
            res.status(400).json(responseMessage);
            console.log(responseMessage);
        }
        else {
            try {

                var procParams = st.db.escape(req.query.ezeid)+','+st.db.escape(DBSecretKey);
                var procQuery = 'CALL pgetbranchesByEzeid(' + procParams + ')';
                console.log(procQuery);
                st.db.query(procQuery, function (err, results) {
                    if (!err) {
                        console.log(results);
                        if (results) {
                            if (results[0]) {
                                if (results[0].length > 0) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Branch loaded successfully';
                                    responseMessage.data = results[0];
                                    res.status(200).json(responseMessage);
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Branch is not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Branch is not available';
                                responseMessage.data = null;
                                res.status(200).json(responseMessage);
                            }

                        }
                        else {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Branch is not available';
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
                        console.log('Error : pgetbranches ', err);
                        var errorDate = new Date();
                        console.log(errorDate.toTimeString() + ' ......... error ...........');

                    }
                });


            } catch (ex){
                responseMessage.error = {
                    server: 'Internal Server Error'
                };
                responseMessage.message = 'An error occurred !';
                res.status(500).json(responseMessage);
                console.log('Error getBranch :  ', ex);
                var errorDate = new Date();
                console.log(errorDate.toTimeString() + ' ......... error ...........');
            }
        }
    }

};


module.exports = ProfileBranch;
