/**
 * Created by Gowrishankar on 16-09-2015.
 */

"use strict";

var FinalMessage = {
    Message: '',
    StatusCode: '',
    Result: ''
};
var FinalMsgJson = JSON.parse(JSON.stringify(FinalMessage));

function error(err, req, res, next) {
    console.error(err.stack);
    console.log('Error Occurred Please try Again..');
    res.json(500,{ status : false, message : 'Internal Server Error', error : {server : 'Exception'}});
};

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

function Recruitment(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};



/**
 * @todo FnGetRecruitmentMasters
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @param flag <int> for different result
 * @description api code for get Recruitment Masters list
 */
Recruitment.prototype.getRecruitmentMasters = function(req,res,next){

    var token = req.query.token;
    var functionType = req.query.function_type;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };


    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            var flag = (req.query.flag) ? (req.query.flag) : 0 ;
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        //institutes
                        var query = 'CALL pGetInstitutes();';

                        //get folder list
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(functionType);
                        var nCombQuery = queryParams + ',' + st.db.escape(flag);
                        var query1 = 'CALL pGetFolderList('+ nCombQuery + ');';

                        //specialization
                        var query2 = 'CALL pGetSpecialization(' + st.db.escape('') + ');';

                        //GetEducations
                        var queryParams4 = st.db.escape(flag);
                        var query3 = 'CALL pGetEducations('+ queryParams4 +');';

                        //get jobslist
                        var queryParams2 = st.db.escape(token);
                        var query4 = 'CALL PgetListofjobs(' + queryParams2 + ');';

                        //get subuser list
                        var query5 = 'CALL pGetSubUserList('+ queryParams2 + ');';

                        //GetActionType
                        var query6 = 'CALL pGetActionType('+ queryParams + ');';

                        //GetStatusType
                        var query7 = 'CALL pGetStatusType('+ queryParams + ');';

                        var combinedQuery = query + query1 + query2 + query3 + query4 + query5 + query6 + query7;

                        //console.log(combinedQuery);

                        st.db.query(combinedQuery, function (err, getResult) {

                            if(!err){
                                if (getResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Recruitment Masters List loaded successfully';
                                    responseMessage.data = {
                                        institutes: getResult[0],
                                        folders: getResult[2],
                                        specialization: getResult[4],
                                        educations: getResult[6],
                                        jobs: getResult[8],
                                        subusers: getResult[10],
                                        actions: getResult[12],
                                        stages: getResult[14]
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetRecruitmentMasters: Recruitment Masters List loaded successfully');
                                }
                                else {
                                    responseMessage.message = 'Recruitment Masters List not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetRecruitmentMasters:Recruitment Masters List not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetRecruitmentMasters: error in getting Recruitment:' + err);
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
                        console.log('FnGetRecruitmentMasters: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetRecruitmentMasters:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetRecruitmentMasters ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetSalesMasters
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for get Recruitment Masters list
 */
Recruitment.prototype.getSalesMasters = function(req,res,next){

    var token = req.query.token;
    var functionType = req.query.function_type;
    var flag =  (req.query.flag) ? req.query.flag : 0 ;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };


    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        //company details
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(functionType);
                        var query = 'CALL pGetCompanyDetails(' + queryParams + ');';

                        //get folder list
                        //var newQueryParam = st.db.escape(flag);
                        var nCombQuery = queryParams + ',' + st.db.escape(flag);
                        var query1 = 'CALL pGetFolderList('+ nCombQuery + ');';

                        //get subuser list
                        var queryParams1 = st.db.escape(token);
                        var query2 = 'CALL pGetSubUserList('+ queryParams1 + ');';

                        //GetActionType
                        var query3 = 'CALL pGetActionType('+ queryParams + ');';

                        //GetStatusType
                        var query4 = 'CALL pGetStatusType('+ queryParams + ');';

                        var combinedQuery = query + query1 + query2 + query3 + query4;

                        console.log(combinedQuery);

                        st.db.query(combinedQuery, function (err, getResult) {
                            //console.log(getResult);

                            if(!err){
                                if (getResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Sales Masters List loaded successfully';
                                    responseMessage.data = {
                                        company_details: getResult[0],
                                        folders: getResult[2],
                                        subusers: getResult[4],
                                        actions: getResult[6],
                                        stages: getResult[8],
                                        items : getResult[10]
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetSalesMasters: Sales Masters List loaded successfully');
                                }
                                else {
                                    responseMessage.message = 'Sales Masters List not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetSalesMasters:Sales Masters List not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetSalesMasters: error in getting SalesMasters:' + err);
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
                        console.log('FnGetSalesMasters: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetSalesMasters:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetSalesMasters ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 *
 * @author Indra Jeet
 * @description Get list of all colleges and group of colleges
 * @param req
 * @param res
 * @param next
 *
 * @service-param token <string> Logged in user token
 * @produces List of colleges and Group of colleges
 *
 */
Recruitment.prototype.getInstitutesList = function(req,res,next){

    var responseMessage = {
        status : false,
        message : "Internal Server Error",
        error : { server : 'Internal Server Error'},
        data : null
    };

    try {
        st.validateToken(req.query.token, function (err, tokenResult) {

            if (!err) {

                if (tokenResult) {
                    var instituteListQuery = "CALL pgetinstituelist(" + st.db.escape(req.query.token) + ")";
                    console.log(instituteListQuery);

                    st.db.query(instituteListQuery, function (err, instituteListResult) {

                        if (!err) {
                            if (instituteListResult) {
                               // console.log('instituteListResult', instituteListResult);
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Colleges and Group of colleges list loaded successfully';
                                responseMessage.data = (instituteListResult[0]) ?((instituteListResult[0].length) ? instituteListResult[0] : []) : [];
                                res.status(200).json(responseMessage);
                                console.log('Colleges and Group of colleges list loaded successfully');
                            }
                            else {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.data = [];
                                responseMessage.message = 'Colleges and Group of colleges list not loaded';
                                res.status(200).json(responseMessage);
                                console.log('Colleges and Group of colleges list loaded successfully');
                            }
                        }
                        else{
                            res.status(500).json(responseMessage);
                        }
                    });


                }
                else {
                    responseMessage.message = "Please login to continue";
                    responseMessage.error = {
                        token : "Invalid token"
                    };
                    res.status(401).json(responseMessage);
                }
            }
            else {
                res.status(500).json(responseMessage);
            }
        });

    }

    catch(ex){
        responseMessage.error = {
            server: 'Internal Server Error'
        };
        responseMessage.message = 'An error occurred !';
        res.status(500).json(responseMessage);
        console.log('Error : getInstitutesList ');
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }

};

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get last 100 CV
 * @accepts json
 * @param token <string> token of login user
 * @param limit <int> limit of data
 *
 */
Recruitment.prototype.getLatestCV = function(req,res,next){
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
    var limit = (!isNaN(parseInt(req.query.limit))) ? parseInt(req.query.limit) : 10 ;
    limit = (limit > 100) ? 100 : limit ;

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
                        var procParams = st.db.escape(req.query.token) + ',' + st.db.escape(limit);
                        var procQuery = 'CALL get_last_candidate(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'CV loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'CV are not available';
                                            responseMessage.data = [];
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'CV are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'CV are not available';
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
                                console.log('Error : get_last_candidate ',err);
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
                        console.log('getLatestCV: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : getLatestCV ',err);
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
            console.log('Error getLatestCV :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};


module.exports = Recruitment;












