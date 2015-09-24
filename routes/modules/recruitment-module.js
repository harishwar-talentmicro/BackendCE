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

var path ='D:\\EZEIDBanner\\';
var EZEIDEmail = 'noreply@ezeone.com';

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
 * @description api code for get Recruitment Masters list
 */
Recruitment.prototype.getRecruitmentMasters = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var functionType = req.query.function_type;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };


    var validateStatus = true, error = {};

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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {

                        //institutes
                        var query = 'CALL pGetInstitutes();';

                        //get folder list
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(functionType);
                        var query1 = 'CALL pGetFolderList('+ queryParams + ');';

                        //specialization
                        var query2 = 'CALL pGetSpecialization(' + st.db.escape('') + ');';

                        //GetEducations
                        var query3 = 'CALL pGetEducations();';

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
    var _this = this;

    var token = req.query.token;
    var functionType = req.query.function_type;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };


    var validateStatus = true, error = {};

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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        //company details
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(functionType);
                        var query = 'CALL pGetCompanyDetails(' + queryParams + ');';

                        //get folder list
                        var query1 = 'CALL pGetFolderList('+ queryParams + ');';

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


module.exports = Recruitment;












