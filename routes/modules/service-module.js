/**
 *  @author Gowri shankar
 *  @since December 28,2015  12:05PM
 *  @title Loc module
 *  @description Handles Loc related functions
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
                        var queryParams =   st.db.escape(token) + ',' + st.db.escape(dateTime)+ ',' + st.db.escape(lat)
                        + ',' + st.db.escape(lng);
                        var query = 'CALL pgetserviceproviders(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, serviceResult) {
                            if (!err) {
                                if (serviceResult) {
                                    if(serviceResult[0]){
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'service providers loaded successfully';
                                        for(var i=0; i < serviceResult[0].length; i++){
                                          serviceResult[0][i].tilebanner = serviceResult[0][i].tilebanner ?
                                          req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + serviceResult[0][i].tilebanner: '';
                                        }
                                        responseMessage.data = serviceResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetServiceProviders: service providers loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'service providers not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetServiceProviders:service providers not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'service providers not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetServiceProviders:service providers not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetServiceProviders: error in getting service providers :' + err);
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
                        console.log('FnGetServiceProviders: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetServiceProviders:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetServiceProviders ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


module.exports = Service;
