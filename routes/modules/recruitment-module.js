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
                        var query = st.db.escape(token) + ',' + st.db.escape(functionType);
                        st.db.query('CALL pGetAllApplicanttrackermasterData(' + query + ')', function (err, getResult) {
                            if(!err){
                                if (getResult) {
                                    if (getResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Recruitment Masters List loaded successfully';
                                        responseMessage.data = {
                                            institutes: getResult[0],
                                            folders: getResult[1],
                                            specialization: getResult[2],
                                            educations: getResult[3],
                                            jobs: getResult[4],
                                            subusers: getResult[5],
                                            actions: getResult[6],
                                            stages: getResult[7]
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


module.exports = Recruitment;












