/**
 *  @author Anjali Pandya
 *  @since Feb 03,2016  10:46AM
 *  @title Hris Master module
 *  @description Handles HRIS  functions
 */
"use strict";

var util = require('util');
var validator = require('validator');

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

var st = null;
function HrisHRM(db,stdLib){

    if(stdLib){
        st = stdLib;

    }
};

/**
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description Save HRM
 * @accepts json
 * @param token <string> token of login user
 * @param id <int> id of HRM [insert 0,update id]
 * @param ec <string> employee code,
 * @param jtid <int> jtid is jobtitle id if u r selecting from master
 * @param jt <string> jobtitle if u r entering new title no need to send if u r selecting from master(''),
 * @param fn <string> first name,
 * @param ln <string> last name,
 * @param blocid <int> business location id,
 * @param bloc <string> Business Location title,
 * @param deptid <int> Department id,
 * @param dept <string> department title,
 * @param jdate <datetime> joining date,
 * @param gradeid <int> grade id,
 * @param grade <string> grade title,
 * @param rmid <int> Reporting manager id,
 * @param ezeoneid <string> ezeone id of employee,
 * @param st <int> status  1-Active 2-Quit,
 * @param exitdate <datetime> exit datetime (default null),
 * @param einfn <string> employee information,
 * @param picpath <string> image
 *
 *
 */
HrisHRM.prototype.hrisSaveHRM = function(req,res,next){
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
    if(!req.body.einfn){
        error.einfn = 'Invalid employee information';
        validationFlag *= false;
    }
    if (!validator.isLength((req.body.fn), 3, 45)) {
        error.fn = 'First Name can be maximum 45 characters';
        validationFlag *= false;
    }
    if (req.body.id){
        if (isNaN(req.body.id)) {
            error.id = 'Invalid id of HRM';
            validationFlag *= false;
        }
    }
    else {
        req.body.id = 0;
    }
    if (req.body.jtid){
        if (isNaN(req.body.jtid)) {
            error.jtid = 'Invalid id of Job Title';
            validationFlag *= false;
        }
    }
    else {
        req.body.jtid = 0;
    }
    if (req.body.blocid){
        if (isNaN(req.body.blocid)) {
            error.blocid = 'Invalid id of business location';
            validationFlag *= false;
        }
    }
    else {
        req.body.blocid = 0;
    }
    if (req.body.deptid){
        if (isNaN(req.body.deptid)) {
            error.deptid = 'Invalid id of HRM';
            validationFlag *= false;
        }
    }
    else {
        req.body.deptid = 0;
    }
    if (req.body.gradeid){
        if (isNaN(req.body.gradeid)) {
            error.gradeid = 'Invalid id of grade';
            validationFlag *= false;
        }
    }
    else {
        req.body.gradeid = 0;
    }
    if (req.body.rmid){
        if (isNaN(req.body.rmid)) {
            error.rmid = 'Invalid id of Reporting manager';
            validationFlag *= false;
        }
    }
    else {
        req.body.rmid = 0;
    }
    if (isNaN(req.body.st)) {
        error.st = 'Invalid status';
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
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.id) + ',' + st.db.escape(req.body.ec)
                            + ',' + st.db.escape(req.body.jtid)+ ',' + st.db.escape(req.body.jt)+ ',' + st.db.escape(req.body.fn)
                            + ',' + st.db.escape(req.body.ln)+ ',' + st.db.escape(req.body.blocid)+ ',' + st.db.escape(req.body.bloc)
                            + ',' + st.db.escape(req.body.deptid)+ ',' + st.db.escape(req.body.dept)+ ',' + st.db.escape(req.body.jdate)
                            + ',' + st.db.escape(req.body.gradeid)+ ',' + st.db.escape(req.body.grade)+ ',' + st.db.escape(req.body.rmid)
                            + ',' + st.db.escape(req.body.ezeoneid)+ ',' + st.db.escape(req.body.st)+ ',' + st.db.escape(req.body.exitdate)
                            + ',' + st.db.escape(req.body.einfn)+ ',' + st.db.escape(image);
                        var procQuery = 'CALL psaveHRM(' + procParams + ')';
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
                                                responseMessage.message = 'HRM added successfully';
                                                responseMessage.data = {
                                                    id : results[0][0].id
                                                };
                                                res.status(200).json(responseMessage);
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in adding HRM';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in adding HRM';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in adding  HRM';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }

                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in adding HRM';
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
                                console.log('Error : psaveHRM ',err);
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
                        console.log('hrisSaveHRM: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisSaveHRM ',err);
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
            console.log('Error hrisSaveHRM :  ',ex);
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
 * @description get HRM details
 * @accepts json
 * @param token <string> token of login user
 * @param hrm_id <int> hrm id
 *
 */
HrisHRM.prototype.hrisGetHRM = function(req,res,next){
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
    if (isNaN(req.query.hrm_id) || (req.query.hrm_id <= 0)){
        error.hrm_id = 'Invalid HRM id';
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
                        var procParams = st.db.escape(req.query.hrm_id);
                        var procQuery = 'CALL pgetHRM(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'HRM details loaded successfully';
                                            responseMessage.data = {
                                                hrm : results[0]
                                            };
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'HRM details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'HRM details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'HRM details are not available';
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
                                console.log('Error : pgetHRM ',err);
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
                        console.log('hrisGetHRM: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisGetHRM ',err);
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
            console.log('Error hrisGetHRM :  ',ex);
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
 * @description Save HRM contact details
 * @accepts json
 * @param token <string> token of login user
 * @param hrmid <int> id of HRM
 * @param pr_al1 <string> present addressline 1,
 * @param pr_al2 <stringt> present addressline 2,
 * @param pr_city <string> present city title,
 * @param pr_state <string> present state title,
 * @param pr_country <string> present country,
 * @param pr_pc <int> present address postal code,
 * @param pe_al1 <string> permanent Addressline1,
 * @param pe_al2  <int> permanent Addressline2,
 * @param pe_city <string> permanent city title,
 * @param pe_state <string> permanent state,
 * @param pe_country <string> permanent country ,
 * @param pe_pc <string> permanent postal code,
 * @param mobile <string> mobile number,
 * @param phone <string> phone number,
 * @param email <string> email,
 * @param misd <string> mobile number isd code,
 * @param pisd <string> phone number isd code,
 * @param notes <string> notes of the employer
 *
 */
HrisHRM.prototype.hrisSaveHRMContactDtl = function(req,res,next){
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
    if (isNaN(req.body.hrmid) || (req.body.hrmid <= 0)){
        error.hrmid = 'Invalid HRM id';
        validationFlag *= false;
    }
    if (!validator.isEmail(req.body.email)) {
        error.e = 'Invalid Email';
        validationFlag *= false;
    }
    if (isNaN(req.body.mobile)){
        error.e = 'Invalid Mobile Number';
        validationFlag *= false;
    }
    //if (!validator.isLength((req.body.fn), 3, 45)) {
    //    error.fn = 'First Name can be maximum 45 characters';
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
            var image = null;
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.hrmid) + ',' + st.db.escape(req.body.pr_al1)
                            + ',' + st.db.escape(req.body.pr_al2)+ ',' + st.db.escape(req.body.pr_city)+ ',' + st.db.escape(req.body.pr_state)
                            + ',' + st.db.escape(req.body.pr_country)+ ',' + st.db.escape(req.body.pr_pc)+ ',' + st.db.escape(req.body.pe_al1)
                            + ',' + st.db.escape(req.body.pe_al2)+ ',' + st.db.escape(req.body.pe_city)+ ',' + st.db.escape(req.body.pe_state)
                            + ',' + st.db.escape(req.body.pe_country)+ ',' + st.db.escape(req.body.pe_pc)+ ',' + st.db.escape(req.body.mobile)
                            + ',' + st.db.escape(req.body.phone)+ ',' + st.db.escape(req.body.email)+ ',' + st.db.escape(req.body.misd)
                            + ',' + st.db.escape(req.body.pisd)+ ',' + st.db.escape(req.body.notes);
                        var procQuery = 'CALL psave_hrm_contactdetails(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'HRM contact details added successfully';
                                responseMessage.data = null;
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : psave_hrm_contactdetails ',err);
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
                        console.log('hrisSaveHRMContactDtl: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisSaveHRMContactDtl ',err);
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
            console.log('Error hrisSaveHRMContactDtl :  ',ex);
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
 * @description get HRM contact details
 * @accepts json
 * @param token <string> token of login user
 * @param hrm_id <int> hrm id
 *
 */
HrisHRM.prototype.hrisGetHRMContactDtl = function(req,res,next){
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
    if (isNaN(req.query.hrm_id) || (req.query.hrm_id <= 0)){
        error.hrm_id = 'Invalid HRM id';
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
                        var procParams = st.db.escape(req.query.hrm_id);
                        var procQuery = 'CALL pget_hrm_contactdetails(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'HRM contact details loaded successfully';
                                            responseMessage.data = {
                                                hrm : results[0]
                                            };
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'HRM contact details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'HRM contact details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'HRM contact details are not available';
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
                                console.log('Error : pget_hrm_contactdetails ',err);
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
                        console.log('hrisGetHRMContactDtl: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisGetHRMContactDtl ',err);
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
            console.log('Error hrisGetHRMContactDtl :  ',ex);
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
 * @description save employer salary details
 * @accepts json
 * @param token <string> token of login user
 * @param hrm_id <int> tid of hrm primary details
 * @param ed <datetime> Effective Date
 * @param t_id <int> template ID
 * @param e_sal <array>json objects of ctc and header_id
 */
HrisHRM.prototype.hrisSaveHRMCompnstn = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    if(req.is('json')) {
        var validationFlag = true;
        var error = {};
        if (!req.body.e_sal) {
            error.e_sal = 'Invalid employe salary details';
            validationFlag *= false;
        }
        if (!req.body.token) {
            error.token = 'Invalid token';
            validationFlag *= false;
        }
        if (isNaN(req.body.hrm_id) || (req.body.hrm_id) < 0 ) {
            error.hrm_id = 'Invalid HRM id';
            validationFlag *= false;
        }
        if (isNaN(req.body.t_id) || (req.body.t_id) < 0 ) {
            error.t_id = 'Invalid template id';
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
                var e_sal = req.body.e_sal;
                st.validateToken(req.body.token, function (err, tokenResult) {
                    if (!err) {
                        if (tokenResult) {
                            var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.hrm_id) + ',' + st.db.escape(req.body.ed)
                                + ',' + st.db.escape(req.body.t_id);
                            var procQuery = 'CALL psave_hrmcompensation(' + procParams + ')';
                            console.log(procQuery);
                            st.db.query(procQuery, function (err, results) {
                                if (!err) {
                                    console.log(results);
                                    if (results) {
                                        if (results[0]) {
                                            if (results[0][0]) {
                                                if (results[0][0].id) {
                                                    for (var i = 0; i < e_sal.length; i++) {
                                                        if (e_sal[i].header_id && e_sal[i].ctc) {
                                                            var procParams = st.db.escape(results[0][0].id) + ',' + st.db.escape(e_sal[i].header_id)
                                                                + ',' + st.db.escape(e_sal[i].ctc) ;
                                                            var procQuery = 'CALL psave_hrmcompensation_details(' + procParams + ')';
                                                            console.log(procQuery);
                                                            st.db.query(procQuery, function (err, results) {
                                                                if (!err) {
                                                                    console.log(results);
                                                                    responseMessage.status = true;
                                                                    responseMessage.error = null;
                                                                    responseMessage.message = 'Employe salary details added successfully';
                                                                    responseMessage.data = null;
                                                                    res.status(200).json(responseMessage);
                                                                }
                                                                else {
                                                                    responseMessage.error = {
                                                                        server: 'Internal Server Error'
                                                                    };
                                                                    responseMessage.message = 'An error occurred !';
                                                                    res.status(500).json(responseMessage);
                                                                    console.log('Error : pget_hrmcompensation_details ', err);
                                                                    var errorDate = new Date();
                                                                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                                                                }
                                                            });
                                                        }
                                                        else{
                                                            responseMessage.status = false;
                                                            responseMessage.error = null;
                                                            responseMessage.message = 'Invalid header id or ctc';
                                                            responseMessage.data = null;
                                                            res.status(400).json(responseMessage);
                                                        }
                                                    }
                                                }
                                                else {
                                                    responseMessage.status = false;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'Error in adding employe salary details';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in adding employe salary details';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in adding employe salary details';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in adding employe salary details';
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
                                    console.log('Error : hrisSaveHRMCompnstn ', err);
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
                            console.log('hrisSaveHRMCompnstn: Invalid token');
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'An error occurred !';
                        res.status(500).json(responseMessage);
                        console.log('Error : hrisSaveHRMCompnstn ', err);
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
                console.log('Error hrisSaveHRMCompnstn :  ', ex);
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
 * @description get HRM contact details
 * @accepts json
 * @param token <string> token of login user
 * @param cid <int> compensation id
 *
 */
HrisHRM.prototype.hrisGetHRMCompnstn = function(req,res,next){
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
    if (isNaN(req.query.cid) || (req.query.cid <= 0)){
        error.cid = 'Invalid compensation id';
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
                        var procParams = st.db.escape(req.query.cid);
                        var procQuery = 'CALL pget_hrmcompensation_details(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'compensation details loaded successfully';
                                            responseMessage.data = {
                                                cd : results[0]
                                            };
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'compensation details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'compensation details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'compensation details are not available';
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
                                console.log('Error : pget_hrmcompensation_details ',err);
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
                        console.log('hrisGetHRMContactDtl: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisGetHRMContactDtl ',err);
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
            console.log('Error hrisGetHRMContactDtl :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

module.exports = Hris;
