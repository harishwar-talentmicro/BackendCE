/**
 *  @author Anjali Pandya
 *  @since Feb 01,2016  05:30PM
 *  @title Hris Master module
 *  @description Handles HRIS Master functions
 */
"use strict";


var util = require('util');
var validator = require('validator');



var st = null;
function HrisMaster(db,stdLib){

    if(stdLib){
        st = stdLib;

    }
};

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description gives hris master details of user
 * @accepts json
 * @param token <string> token of login user
 *
 */
HrisMaster.prototype.hrisMasters = function(req,res,next){
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
                            var procQuery = 'CALL pgetbusinesslocation(' + procParams + '); ' +
                                'CALL pgetjobtitle(' + procParams + ')' +
                                ' ; CALL pgetdepartment(' + procParams + ') ;' +
                                ' CALL pgetgrade(' + procParams + ') ; ' +
                                'CALL pget_salary_template(' + procParams + '); ' +
                                'CALL pget_leave_types(' + procParams + ') ; ' +
                                'CALL pget_document_types(' + procParams + ') ; ' +
                                'CALL pget_reporting_manager_List()';

                            console.log(procQuery);

                            st.db.query(procQuery, function (err, results) {
                                if (!err) {
                                    console.log(results);
                                        if (results) {
                                            if (results.length > 0) {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'HIRS Master loaded successfully';
                                                responseMessage.data = {
                                                    bl : results[0],
                                                    jt : results[2],
                                                    dp : results[4],
                                                    gd : results[6],
                                                    st : results[8],
                                                    lt : results[10],
                                                    dc : results[12],
                                                    rp : results[14]

                                                };
                                                res.status(200).json(responseMessage);
                                            }
                                            else {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'HIRS Master is not available';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'HIRS Master is not available';
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
                                    console.log('Error : hrisMasters ',err);
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
                            console.log('hrisMasters: Invalid token');
                        }
                    }
                    else{
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'An error occurred !';
                        res.status(500).json(responseMessage);
                        console.log('Error : hrisMasters ',err);
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
                console.log('Error hrisMasters :  ',ex);
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
 * @param id <int> id is template id
 * @param title <string> title of template
 *
 */
HrisMaster.prototype.hrisSaveSalaryTpl = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    if(req.is('json')) {
        var validationFlag = true;
        var error = {};
        if (!req.body.s_head) {
            error.s_head = 'Invalid template details';
            validationFlag *= false;
        }
        if (!req.body.token) {
            error.token = 'Invalid token';
            validationFlag *= false;
        }
        if (!req.body.title) {
            error.title = 'Invalid title';
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
                    for(var count = 0; count < req.body.s_head; count++){
                        if(typeof(req.body.s_head[count] == 'object')){
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
                                                                    console.log(tplPrevDetailsResult);
                                                                }

                                                                res.status(200).json(tplPrevDetailsResult[0]);
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
                                                    else if(salaryHeadArray.length){

                                                        for(var i = 0; i < salaryHeadArray.length; i++){
                                                            var saveTplDetailsQuery = "CALL psave_salary_template_details("+
                                                                st.db.escape(salaryTplResult[0][0].id) +
                                                                st.db.escape(salaryHeadArray[i].sid) +
                                                                st.db.escape(salaryHeadArray[i].seq) +
                                                                st.db.escape(salaryHeadArray[i].sal_type) +
                                                                + ");";
                                                            comSaveTplDetailsQuery =+ saveTplDetailsQuery;
                                                        }

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
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description gives hris master details of user
 * @accepts json
 * @param token <string> token of login user
 * @param id <int> id of salary header
 * @param title <string> title of salery header
 *
 */
HrisMaster.prototype.hrisSaveSalaryHeader = function(req,res,next){
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
            error.id = 'Invalid id of Salary Header';
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
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.id) + ',' + st.db.escape(req.body.title) ;
                        var procQuery = 'CALL psave_salary_header(' + procParams + ')';
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
                                            responseMessage.message = 'Salary header added successfully';
                                            responseMessage.data = {
                                                id : results[0][0].id
                                            };
                                                res.status(200).json(responseMessage);
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in adding salary header';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in adding salary header';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in adding salary header';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }

                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in adding salary header';
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
                                console.log('Error : businessLocation ',err);
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
                        console.log('businessLocation: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : businessLocation ',err);
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
            console.log('Error businessLocation :  ',ex);
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
 * @description save document type
 * @accepts json
 * @param token <string> token of login user
 * @param id <int> id of salary header
 * @param title <string> title of salery header
 *
 */
HrisMaster.prototype.hrisSaveDocType = function(req,res,next){
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
            error.c = 'Invalid id of Salary Header';
            validationFlag *= false;
        }
    }
    else {
        req.body.id = 0;
    }
    if (!validator.isLength((req.body.title), 3, 100)) {
        error.title = 'Title can be maximum 100 characters';
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
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.id) + ',' + st.db.escape(req.body.title) ;
                        var procQuery = 'CALL psave_document_types(' + procParams + ')';
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
                                                responseMessage.message = 'Document type added successfully';
                                                responseMessage.data = {
                                                    id : results[0][0].id
                                                };
                                                res.status(200).json(responseMessage);
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in adding Document type';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in adding Document type';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in adding Document type';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }

                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in adding Document type';
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
                                console.log('Error : hrisSaveDocType ',err);
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
                        console.log('hrisSaveDocType: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisSaveDocType ',err);
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
            console.log('Error hrisSaveDocType :  ',ex);
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
 * @description save leave type
 * @accepts json
 * @param token <string> token of login user
 * @param id <int> id of salary header
 * @param title <string> title of salery header
 *
 */
HrisMaster.prototype.hrisSaveLeaveType = function(req,res,next){
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
            error.c = 'Invalid id of Salary Header';
            validationFlag *= false;
        }
    }
    else {
        req.body.id = 0;
    }
    if (!validator.isLength((req.body.title), 3, 50)) {
        error.title = 'Title can be maximum 50 characters';
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
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.id) + ',' + st.db.escape(req.body.title) ;
                        var procQuery = 'CALL psave_leave_types(' + procParams + ')';
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
                                                responseMessage.message = 'Leave type added successfully';
                                                responseMessage.data = {
                                                    id : results[0][0].id
                                                };
                                                res.status(200).json(responseMessage);
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in adding leave type';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in adding leave type';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in adding leave type';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }

                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in adding leave type';
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
                                console.log('Error : hrisSaveLeaveType ',err);
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
                        console.log('hrisSaveLeaveType: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisSaveLeaveType ',err);
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
            console.log('Error hrisSaveLeaveType :  ',ex);
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
 * @description get leave type list
 * @accepts json
 * @param token <string> token of login user
 *
 */
HrisMaster.prototype.hrisGetLeaveType = function(req,res,next){
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
                        var procQuery = 'CALL pget_leave_types(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Leave type list loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Leave type list is not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Leave type list is not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }

                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Leave type list is not available';
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
                                console.log('Error : hrisLeaveType ',err);
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
                        console.log('hrisGetLeaveType: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisGetLeaveType ',err);
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
            console.log('Error hrisGetLeaveType :  ',ex);
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
 * @description get document type list
 * @accepts json
 * @param token <string> token of login user
 *
 */
HrisMaster.prototype.hrisGetDocType = function(req,res,next){
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
                        var procQuery = 'CALL pget_document_types(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Document type list loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Document type list is not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Document type list is not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }

                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Document type list is not available';
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
                                console.log('Error : hrisGetDocType ',err);
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
                        console.log('hrisGetDocType: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisGetDocType ',err);
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
            console.log('Error hrisGetDocType :  ',ex);
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
 * @description get salary head list
 * @accepts json
 * @param token <string> token of login user
 *
 */
HrisMaster.prototype.hrisGetSalaryHead = function(req,res,next){
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
                        var procQuery = 'CALL pget_salary_header(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Salary Head list loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Salary Head list is not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Salary Head list is not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }

                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Salary Head list is not available';
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
                                console.log('Error : hrisGetSalaryHead ',err);
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
                        console.log('hrisGetSalaryHead: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisGetSalaryHead ',err);
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
            console.log('Error hrisGetSalaryHead :  ',ex);
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
 * @description get salary template
 * @accepts json
 * @param token <string> token of login user
 *
 */
HrisMaster.prototype.hrisGetSalaryTemp = function(req,res,next){
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
                        var procQuery = 'CALL pget_salary_template(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Salary template loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Salary template is not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Salary template is not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }

                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Salary template is not available';
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
                                console.log('Error : hrisGetSalaryTemp ',err);
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
                        console.log('hrisGetSalaryTemp: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisGetSalaryTemp ',err);
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
            console.log('Error hrisGetSalaryTemp :  ',ex);
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
 * @description get salary template details
 * @accepts json
 * @param token <string> token of login user
 * @param id <int> salary template id
 *
 */
HrisMaster.prototype.hrisGetSalaryTempDetails = function(req,res,next){
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
        error.id = 'Invalid id of salary template';
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
                        var procQuery = 'CALL pget_salary_template_details(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Salary template details loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Salary template details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Salary template details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }

                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Salary template details are not available';
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
                                console.log('Error : hrisGetSalaryTempDetails ',err);
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
                    console.log('Error : hrisGetSalaryTempDetails ',err);
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
            console.log('Error hrisGetSalaryTempDetails :  ',ex);
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
 * @param id <int> salary head id
 *
 */
HrisMaster.prototype.hrisDelSalaryHead = function(req,res,next){
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
        error.id = 'Invalid id of salary head';
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
                        var procQuery = 'CALL pdelete_salary_header(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            if (results[0][0].message) {
                                                if (results[0][0].message == 1){
                                                    responseMessage.status = true;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'Salary head has been deleted successfully';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }
                                                else {
                                                    responseMessage.status = false;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'This salary head is in use, you cannot delete it';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in deleting salary head';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in deleting salary head';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in deleting salary head';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in deleting salary head';
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
                                console.log('Error : pdelete_salary_header ',err);
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
                    console.log('Error : hrisGetSalaryTempDetails ',err);
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
            console.log('Error hrisGetSalaryTempDetails :  ',ex);
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
 * @description DELETE leave type
 * @accepts json
 * @param token <string> token of login user
 * @param id <int> leave type id
 *
 */
HrisMaster.prototype.hrisDelLeaveType = function(req,res,next){
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
        error.id = 'Invalid id of leave type';
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
                        var procQuery = 'CALL pdelete_leavetype(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            if (results[0][0].message) {
                                                if (results[0][0].message == 1){
                                                    responseMessage.status = true;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'Leave type has been deleted successfully';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }
                                                else {
                                                    responseMessage.status = false;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'This leave type is in use, you cannot delete it';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in deleting leave type';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in deleting leave type';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in deleting leave type';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in deleting leave type';
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
                                console.log('Error : pdelete_leavetype ',err);
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
                        console.log('hrisDelLeaveType: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisDelLeaveType ',err);
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
            console.log('Error hrisDelLeaveType :  ',ex);
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
 * @description DELETE leave type
 * @accepts json
 * @param token <string> token of login user
 * @param id <int> document type id
 *
 */
HrisMaster.prototype.hrisDelDocType = function(req,res,next){
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
        error.id = 'Invalid id of document type';
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
                        var procQuery = 'CALL pdelete_document_type(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            if (results[0][0].message) {
                                                if (results[0][0].message == 1){
                                                    responseMessage.status = true;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'Document type has been deleted successfully';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }
                                                else {
                                                    responseMessage.status = false;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'This document type is in use, you cannot delete it';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in deleting document type';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in deleting document type';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in deleting document type';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in deleting document type';
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
                                console.log('Error : pdelete_document_type ',err);
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
                        console.log('hrisDelDocType: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisDelDocType ',err);
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
            console.log('Error hrisDelDocType :  ',ex);
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
 * @description DELETE leave type
 * @accepts json
 * @param token <string> token of login user
 * @param id <int> salary temp id
 *
 */
HrisMaster.prototype.hrisDelSalaryTpl = function(req,res,next){
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
        error.id = 'Invalid id of salary template';
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
                        var procQuery = 'CALL pdelete_salary_template(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            if (results[0][0].message) {
                                                if (results[0][0].message == 1){
                                                    responseMessage.status = true;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'Salary template has been deleted successfully';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }
                                                else {
                                                    responseMessage.status = false;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'This salary template is in use, you cannot delete it';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in deleting salary template';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in deleting salary template';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in deleting salary template';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in deleting salary template';
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
                                console.log('Error : pdelete_salary_template ',err);
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
                        console.log('hrisDelSalaryTpl: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisDelSalaryTpl ',err);
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
            console.log('Error hrisDelSalaryTpl :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

module.exports = HrisMaster;


