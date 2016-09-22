/**
 * @author Anjali Pandya
 * @description
 * @since Sept 19, 2016 04:19 PM IST
 */

var request = require('request');
var validator = require('validator');
var AlumniCtrl = {};


AlumniCtrl.validateCommunity = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    var error = {};

    if(!req.query.q){
        error.q = 'Please enter keyword';
        validationFlag *= false;
    }
    if(!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.q)
                ];
                /**
                 * Calling procedure to save deal
                 * @type {string}
                 */
                var procQuery = 'CALL pvalidate_community (' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    if(!err && result && result[0]){
                        response.status = true;
                        response.message = "Community loaded successfully";
                        response.error = null;
                        response.data = {
                            communityList : result[0]
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "No result found";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }
};

AlumniCtrl.profileDetails = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    var error = {};

    if(!req.query.serviceMasterId){
        error.serviceMasterId = 'Please enter service masterId';
        validationFlag *= false;
    }
    //if(!req.query.communityType){
    //    error.communityType = 'Please enter community type';
    //    validationFlag *= false;
    //}
    if(!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.serviceMasterId),
                    req.st.db.escape(req.query.communityType)
                ];
                /**
                 * Calling procedure to save deal
                 * @type {string}
                 */
                var procQuery = 'CALL pget_community_profile_details(' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    if(!err && result && result[0]){
                        console.log('result',result);
                        response.status = true;
                        response.message = "Community profile loaded successfully";
                        response.error = null;
                        response.data = {
                            profileDetails : result[0][0]
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }
};

AlumniCtrl.education = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    var error = {};

    if(!req.query.serviceMasterId){
        error.serviceMasterId = 'Please enter service masterId';
        validationFlag *= false;
    }
    //if(!req.query.communityType){
    //    error.communityType = 'Please enter community type';
    //    validationFlag *= false;
    //}
    if(!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.serviceMasterId)
                ];
                /**
                 * Calling procedure to save deal
                 * @type {string}
                 */
                var procQuery = 'CALL pget_community_education(' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    if(!err && result && result[0]){
                        console.log('result',result);
                        response.status = true;
                        response.message = "Education loaded successfully";
                        response.error = null;
                        response.data = {
                            educationList : result[0]
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }
};

module.exports = AlumniCtrl;