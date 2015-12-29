/**
 *  @author Gowri shankar
 *  @since December 28,2015  12:05PM
 *  @title service module
 *  @description Handles service related functions
 */
"use strict";

var st = null;
function Service(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
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


/**
 * @todo FnGetServiceProviders
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get service providers
 */
Service.prototype.getServiceProviders = function(req,res,next){

    var token = req.query.token;
    var dateTime = req.query.dt;
    var lat = req.query.lat ? req.query.lat : 0.00;
    var lng = req.query.lng ? req.query.lng : 0.00;
    var serviceType = parseInt(req.query.service_type);

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Sorry! token is mandatory'
        console.log('token is mandatory');
        validateStatus *= false;
    }
    if(isNaN(serviceType)){
        error['service_type'] = 'Sorry! service_type is not integer value'
        console.log('service_type is a integer value');
        validateStatus *= false;
    }

    if(!validateStatus){
        res.json(error);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams =   st.db.escape(token) + ',' + st.db.escape(dateTime)+ ',' + st.db.escape(lat)
                            + ',' + st.db.escape(lng)+ ',' + st.db.escape(serviceType);
                        var query = 'CALL pgetserviceproviders(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, serviceResult) {
                            if (!err) {
                                if (serviceResult) {
                                    if(serviceResult[0]){
                                        if(serviceResult[1]){
                                            for(var i=0; i < serviceResult[1].length; i++){
                                                serviceResult[1][i].tilebanner = serviceResult[1][i].tilebanner ?
                                                req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + serviceResult[1][i].tilebanner: '';
                                            }
                                            res.status(200).json({
                                                totalcount : serviceResult[0][0].totalcount,
                                                Result : serviceResult[1]
                                            });
                                            console.log('FnGetServiceProviders: service providers loaded successfully');
                                        }
                                        else {
                                            res.status(200).json(null);
                                            console.log('FnGetServiceProviders:service providers not loaded');
                                        }
                                    }
                                    else {
                                        res.status(200).json(null);
                                        console.log('FnGetServiceProviders:service providers not loaded');
                                    }
                                }
                                else {
                                    res.status(200).json(null);
                                    console.log('FnGetServiceProviders:service providers not loaded');
                                }
                            }
                            else {
                                error['Server'] = 'Internal Server Error';
                                res.status(500).json(error);
                                console.log('FnGetServiceProviders: error in getting service providers :' + err);
                            }
                        });
                    }
                    else {
                        error['token'] = 'Sorry! token is invalid';
                        res.status(401).json(error);
                        console.log('FnGetServiceProviders: Invalid token');
                    }
                }
                else {
                    error['token'] = 'Sorry! Error in validating Token'
                    res.status(500).json(error);
                    console.log('FnGetServiceProviders:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            res.status(500).json(null);
            console.log('Error : FnGetServiceProviders ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnGetServices
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get services
 */
Service.prototype.getServices = function(req,res,next){

    var token = req.query.token;
    var masterId = parseInt(req.query.master_id);
    var status = parseInt(req.query.s);

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'token is mandatory';
        validateStatus *= false;
    }
    if(isNaN(status)){
        error['status'] = 'status is not integer value';
        validateStatus *= false;
    }
    if(isNaN(masterId)){
        error['master_id'] = 'master_id is not integer value';
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
                        var queryParams =   st.db.escape(masterId) + ',' + st.db.escape(token)+ ',' + st.db.escape(status);
                        var query = 'CALL ploadservices(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, serviceResult) {
                            if (!err) {
                                if (serviceResult) {
                                    if(serviceResult[0]){
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'services loaded successfully';
                                        responseMessage.data = serviceResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetServices: services loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'services not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetServices:services not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'services not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetServices:services not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetServices: error in getting services:' + err);
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
                        console.log('FnGetServices: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetServices:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetServices ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**

 * @todo FnGetServiceCategories
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get service categories
 */
Service.prototype.getServiceCategories= function(req,res,next){

    var token = req.query.token;
    var masterId = parseInt(req.query.master_id);

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'token is mandatory';
        validateStatus *= false;
    }
    if(isNaN(masterId)){
        error['master_id'] = 'master_id is not integer value';
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
                        var queryParams =   st.db.escape(masterId);
                        var query = 'CALL pgetservicecatagories(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, categoryResult) {
                            if (!err) {
                                if (categoryResult) {
                                    if(categoryResult[0]){
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'service categories loaded successfully';
                                        responseMessage.data = categoryResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetServiceCategories: service categories loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'service categories not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetServiceCategories:service categories not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'service categories not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetServiceCategories:service categories not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetServiceCategories: error in getting service categories:' + err);
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
                        console.log('FnGetServiceCategories: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetServiceCategories:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetServiceCategories ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetServiceDetails
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get service Details
 */
Service.prototype.getServiceDetails = function(req,res,next){

    var token = req.query.token;
    var serviceId = parseInt(req.query.id);

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'token is mandatory';
        validateStatus *= false;
    }
    if(isNaN(serviceId)){
        error['id'] = 'id is not integer value';
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
                        var queryParams =   st.db.escape(serviceId);
                        var query = 'CALL ploadservicedetails(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, details) {
                            if (!err) {
                                if (details) {
                                    if(details[0]){
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'service details loaded successfully';
                                        responseMessage.data = details[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetServiceDetails: service details loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'service details not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetServiceDetails:service details not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'service details not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetServiceDetails:service details not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetServiceDetails: error in getting service details:' + err);
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
                        console.log('FnGetServiceDetails: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetServiceDetails:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetServiceDetails ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

// still not complete this method
/**
 * @todo FnCreateService
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @param token (char(36))
 * @param master_id (int)
 * @param message (VARCHAR(250))
 * @param cid (int) category id
 * @param pic  (file)
 * @description api code for created new service
 */
Service.prototype.createService = function(req,res,next){

    /**
     * checking input parameters are json or not
     */
    var isJson = req.is('json');

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    if(!isJson){
        error['isJson'] = 'Invalid Input ContentType';
        validateStatus *= false;
    }
    else{
        /**
         * storing and validating the input parameters from front end
         */

        var token = req.body.token;
        var masterId = parseInt(req.body.master_id);
        var categoryId = parseInt(req.body.cid);

        if(!(token)){
            error['token'] = 'token is Mandatory';
            validateStatus *= false;
        }
        if(isNaN(masterId)){
            error['masterId'] = 'masterId is not integer value';
            validateStatus *= false;
        }

        if(isNaN(categoryId)){
            error['categoryId'] = 'categoryId is not integer value';
            validateStatus *= false;
        }
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {

                        /**
                         * @todo pic upload to cloud server
                         */


                        var queryParams = st.db.escape(token) + ',' + st.db.escape(masterId)
                            + ',' + st.db.escape(req.body.message) + ',' + st.db.escape(categoryId)
                            + ',' + st.db.escape(req.body.pic);

                        var query = 'CALL ppostservice(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, serviceResult) {
                            if (!err) {
                                if (serviceResult) {
                                    responseMessage.status = true;
                                    responseMessage.message = 'LocMap saved successfully';
                                    responseMessage.data = id;
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveLocMap: LocMap saved successfully');
                                }
                                else {
                                    responseMessage.message = 'LocMap not saved';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveLocMap:LocMap not saved');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnSaveLocMap: error in saving LocMap  :' + err);
                            }

                        });

                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveLocMap: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveLocMap:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnSaveLocMap ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


module.exports = Service;
