/**
 *  @author Gowri shankar
 *  @since December 28,2015  12:05PM
 *  @title Loc module
 *  @description Handles Loc related functions
 */
"use strict";

var st = null;
function Loc(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};


/**
 * @todo FnSaveLocMap
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @param token (char)
 * @param type (int)
 * @param loc_id (int)
 * @param internship_count (int)
 * @param freshers_ctc (Decimal)
 * @param freshers_count (int)
 * @param lateral_count (int)
 * @param id (int)
 * @description api code for save loc map
 */
Loc.prototype.saveLocMap = function(req,res,next){

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

    var validateStatus = true;
    var error = {};

    if(!isJson){
        error['isJson'] = 'Invalid Input ContentType';
        validateStatus *= false;
    }
    else{
        /**
         * getting,storing and validating the input parameters from front end
         */
        var id = 0;
        var locMap = req.body.loc;

        if(!(req.body.token)){
            error['token'] = 'Token is Mandatory';
            validateStatus *= false;
        }

        if(!locMap){
            locMap = [];
        }
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams1 = st.db.escape(req.body.tids) + ',' + st.db.escape(req.body.token) + ',' + st.db.escape(req.body.type);
                        var query1 = 'CALL pdeletelocmap(' + queryParams1 + ')';
                        console.log(query1);
                        st.db.query(query1, function (err, deleteResult) {
                            if (!err) {
                                console.log(deleteResult);
                                console.log('LocMap Deleted Sucessfully');
                            }
                            else {
                                console.log('error from delete locmap');
                            }
                        });

                        if(isJson){

                            for (var i = 0; i < locMap.length; i++) {
                                console.log("locMap :"+locMap);
                                var locDetails = {

                                    fid: locMap[i].fid,
                                    locId: locMap[i].career_id,
                                    tid: locMap[i].tid,
                                    internshipCount: locMap[i].interns_count,
                                    fresherCtc: locMap[i].fresher_ctc,
                                    fresherCount: locMap[i].fresher_count,
                                    lateralCount: locMap[i].lateral_count,
                                    type: locMap[i].type
                                };
                                console.log("locDetails :"+locDetails);
                                var queryParams = st.db.escape(req.body.token) + ',' + st.db.escape(locDetails.locId) + ',' + st.db.escape(locDetails.type)
                                    + ',' + st.db.escape(locDetails.internshipCount) + ',' + st.db.escape(locDetails.fresherCtc)
                                    + ',' + st.db.escape(locDetails.fresherCount) + ',' + st.db.escape(locDetails.lateralCount)
                                    + ',' + st.db.escape(locDetails.tid);
                                var query = 'CALL pSaveLocMap(' + queryParams + ')';
                                console.log(query);
                                st.db.query(query, function (err, insertResult) {
                                    if (!err) {
                                        console.log(insertResult);
                                        if (insertResult) {
                                            id = insertResult[0][0] ? insertResult[0][0].id : 0;
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
                            responseMessage.status = true;
                            responseMessage.message = 'LocMap saved successfully';
                            responseMessage.data = id;
                            res.status(200).json(responseMessage);
                            console.log('FnSaveLocMap: LocMap saved successfully');
                        }
                        else {
                            responseMessage.message = 'Invalid Input Content Type';
                            res.status(200).json(responseMessage);
                            console.log('FnSaveLocMap:Invalid Input Content Type');
                        }
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


/**
 * @todo FnGetLocMap
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get loc map
 */
Loc.prototype.getLocMap = function(req,res,next){

    var token = req.query.token;
    var type = req.query.type;  // (1-employer,2-training)

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
                        var queryParams =   st.db.escape(token) + ',' + st.db.escape(type);
                        var query = 'CALL pgetlocmap(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if(getResult[0]){
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'LocMap loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetLOCMap: LocMap loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'LocMap not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetLOCMap:LocMap not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'LocMap not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetLOCMap:LocMap not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetLOCMap: error in getting LocMap :' + err);
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
                        console.log('FnGetLOCMap: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetLOCMap:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetLOCMap ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnLoadLocDetailsEmployer
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get loc details
 */
Loc.prototype.loadLocDetailsEmployer = function(req,res,next){


    var token = req.query.token;
    var locId = req.query.loc_id;
    var type = 1;      // (1-employer,2-training)
    var lat = (req.query.lat) ? req.query.lat : '';
    var lng = (req.query.lng) ? req.query.lng : '';
    var pageSize = (req.query.page_size) ? req.query.page_size : 100;
    var pageCount = (req.query.page_count) ? req.query.page_count : 0;
    var keyword = (req.query.keyword) ? req.query.keyword : '';

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
                        var queryParams =   st.db.escape(locId) + ',' + st.db.escape(type)+ ',' + st.db.escape(lat)
                            + ',' + st.db.escape(lng)+ ',' + st.db.escape(pageSize)+ ',' + st.db.escape(pageCount)
                            + ',' + st.db.escape(keyword);
                        var query = 'CALL pLoadLOCDetails(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getResult) {

                            if (!err) {
                                if (getResult) {
                                    if(getResult[0]) {
                                        if (getResult[0][0]) {
                                            if (getResult[0][0].message != -2) {

                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Employer LocDetails loaded successfully';
                                                responseMessage.data = {
                                                    count: getResult[0][0].count,
                                                    sic: getResult[0][0].sic,
                                                    sfc: getResult[0][0].sfc,
                                                    slc: getResult[0][0].slc,
                                                    result: getResult[1]
                                                };
                                                res.status(200).json(responseMessage);
                                                console.log('FnLoadLocDetails: Employer LocDetails loaded successfully');
                                            }
                                            else {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Employer LocDetails loaded successfully';
                                                responseMessage.data = {
                                                    result: getResult[0]
                                                };
                                                res.status(200).json(responseMessage);
                                                console.log('FnLoadLocDetails: Employer LocDetails loaded successfully');
                                            }
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Employer LocDetails loaded successfully';
                                            responseMessage.data = {
                                                result: getResult[0]
                                            };
                                            res.status(200).json(responseMessage);
                                            console.log('FnLoadLocDetails: Employer LocDetails loaded successfully');
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'Employer LocDetails not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnLoadLocDetails:Employer LocDetails not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Employer LocDetails not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnLoadLocDetails:Employer LocDetails not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnLoadLocDetails: error in getting Employer LocDetails :' + err);
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
                        console.log('FnLoadLocDetails: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnLoadLocDetails:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnLoadLocDetails ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnLoadLocDetailsTrainer
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get loc details
 */
Loc.prototype.loadLocDetailsTrainer = function(req,res,next){

    var token = req.query.token;
    var locId = req.query.loc_id;
    var type = 2;      // (1-employer,2-training)
    var lat = (req.query.lat) ? req.query.lat : '';
    var lng = (req.query.lng) ? req.query.lng : '';
    var pageSize = (req.query.page_size) ? req.query.page_size : 100;
    var pageCount = (req.query.page_count) ? req.query.page_count : 0;
    var keyword = (req.query.keyword) ? req.query.keyword : '';

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
                        var queryParams =   st.db.escape(locId) + ',' + st.db.escape(type)+ ',' + st.db.escape(lat)
                            + ',' + st.db.escape(lng)+ ',' + st.db.escape(pageSize)+ ',' + st.db.escape(pageCount)
                            + ',' + st.db.escape(keyword);
                        var query = 'CALL pLoadLOCDetails(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getResult) {
                            console.log(getResult);
                            if (!err) {
                                if (getResult) {
                                    if(getResult[0]) {
                                        if (getResult[0][0]) {
                                            if (getResult[0][0].message != -2) {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Trainer LocDetails loaded successfully';
                                                responseMessage.data = {
                                                    count: getResult[0][0].count,
                                                    sic: getResult[0][0].sic,
                                                    sfc: getResult[0][0].sfc,
                                                    slc: getResult[0][0].slc,
                                                    result: getResult[1]
                                                };
                                                res.status(200).json(responseMessage);
                                                console.log('FnLoadLocDetails: Trainer LocDetails loaded successfully');
                                            }
                                            else {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Trainer LocDetails loaded successfully';
                                                responseMessage.data = {
                                                    result: getResult[0]
                                                };
                                                res.status(200).json(responseMessage);
                                                console.log('FnLoadLocDetails:Trainer LocDetails loaded successfully');
                                            }
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Trainer LocDetails loaded successfully';
                                            responseMessage.data = {
                                                result: getResult[0]
                                            };
                                            res.status(200).json(responseMessage);
                                            console.log('FnLoadLocDetails:Trainer LocDetails loaded successfully');
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'Trainer LocDetails not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnLoadLocDetails:Trainer LocDetails not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Trainer LocDetails not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnLoadLocDetails:Trainer LocDetails not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnLoadLocDetails: error in getting Trainer LocDetails :' + err);
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
                        console.log('FnLoadLocDetails: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnLoadLocDetails:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnLoadLocDetails ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnLoadLocDetailsSyllabus
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get loc details
 */
Loc.prototype.loadLocDetailsSyllabus = function(req,res,next){

    var token = req.query.token;
    var locId = req.query.loc_id;

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
                        var queryParams =   st.db.escape(locId) + ',' + st.db.escape(0)+ ',' + st.db.escape(0.00)
                            + ',' + st.db.escape(0.00)+ ',' + st.db.escape(0)+ ',' + st.db.escape(0)
                            + ',' + st.db.escape('');
                        var query = 'CALL pLoadLOCDetails(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getResult) {
                            //console.log(getResult);
                            if (!err) {
                                if (getResult) {
                                    if(getResult[0]){
                                        if(getResult[0][0]){
                                            if(getResult[0][0].message != -2){
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Syllabus LocDetails loaded successfully';
                                                getResult[0][0].url = (getResult[0][0].url) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + getResult[0][0].url) : '';
                                                responseMessage.data = {url: getResult[0][0].url};
                                                res.status(200).json(responseMessage);
                                                console.log('FnLoadLocDetails: Syllabus LocDetails loaded successfully');
                                            }
                                            else{
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Syllabus LocDetails loaded successfully';
                                                responseMessage.data = getResult[0][0];
                                                res.status(200).json(responseMessage);
                                                console.log('FnLoadLocDetails: Syllabus LocDetails loaded successfully');}
                                        }
                                        else{
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Syllabus LocDetails loaded successfully';
                                            responseMessage.data = [];
                                            res.status(200).json(responseMessage);
                                            console.log('FnLoadLocDetails: Syllabus LocDetails loaded successfully');}
                                    }

                                    else {
                                        responseMessage.message = 'Syllabus LocDetails not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnLoadLocDetails:Syllabus LocDetails not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Syllabus LocDetails not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnLoadLocDetails:Syllabus LocDetails not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnLoadLocDetails: error in getting Syllabus LocDetails :' + err);
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
                        console.log('FnLoadLocDetails: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnLoadLocDetails:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnLoadLocDetails ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetLoc
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get loc
 */
Loc.prototype.getLoc = function(req,res,next){

    var token = req.query.token;
    var functionId = req.query.fid;


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

            var queryParams = st.db.escape(functionId);
            var query = 'CALL pgetLOC(' + queryParams + ')';
            //console.log(query);
            st.db.query(query, function (err, locResult) {
                //console.log(getResult);
                if (!err) {
                    if (locResult) {
                        if (locResult[0]) {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Loc loaded sucessfully';
                            responseMessage.data = locResult[0];
                            res.status(200).json(responseMessage);
                            console.log('FnGetLoc: Loc loaded sucessfully');
                        }
                        else {
                            responseMessage.message = 'Loc is not loaded';
                            res.status(200).json(responseMessage);
                            console.log('FnGetLoc:Loc is not loaded');
                        }
                    }
                    else {
                        responseMessage.message = 'Loc is not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnGetLoc:Loc is not loaded');
                    }
                }
                else {
                    responseMessage.message = 'An error occured ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnGetLoc: error in getting Loc :' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetLoc ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnSaveLoc
 * Method : post
 * @param req
 * @param res
 * @param next
 * @description api code for get save loc
 */
Loc.prototype.saveLoc = function(req,res,next){

   // var fs = require("fs");

    var token = req.body.token;
    var functionId = req.body.fid;
    var locationTitle = req.body.loc_title;
    var locationGuide = req.body.loc_guide;
    var docTitle = req.body.doc_title;
    var docFilename = req.body.doc_filename;
    var id = req.body.id;

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
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(functionId) + ','  + st.db.escape(locationTitle)+ ','  + st.db.escape(locationGuide)
                            + ','  + st.db.escape(docTitle)+ ','  + st.db.escape(docFilename)+ ','  + st.db.escape(id);
                        var query = 'CALL pSaveLOC(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'loc Saved successfully';
                                    responseMessage.data = {
                                        fid : req.body.fid,
                                        loc_title : req.body.loc_title,
                                        loc_guide : req.body.loc_guide,
                                        doc_title : req.body.doc_title,
                                        doc_filename : req.body.doc_filename,
                                        id : req.body.id
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveLoc: loc Saved  successfully');
                                }
                                else {
                                    responseMessage.message = 'loc not Saved';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveLoc:loc not Saved');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnSaveLoc: error in saving loc:' + err);
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
                        console.log('FnSaveLoc: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveLoc:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnSaveLoc ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetLocBasket
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get loc basket
 */
Loc.prototype.getLocBasket = function(req,res,next){

    var token = req.query.token;
    var locId = req.query.loc_id;
    var type = (!isNaN(parseInt(req.query.type))) ?  parseInt(req.query.type) : 0;
    //type - (0-Exclude hidden Applicants , 1-Include hidden Applicants , 2-Show hidden Applications only)
    var latitude = (req.query.lat) ? req.query.lat : 0.00;
    var longitude = (req.query.lng) ? req.query.lng : 0.00;
    var firstNameSort = (!isNaN(parseInt(req.query.fns))) ?  parseInt(req.query.fns) : 0;  // 0 -descending, 1-ascending
    var firstNameQuery = (req.query.fnq) ? req.query.fnq : '';                              // filter text
    var lastNameSort =(!isNaN(parseInt(req.query.lns))) ?  parseInt(req.query.lns) : 0;
    var lastNameQuery = (req.query.lnq) ? req.query.lnq : '';
    var emailSort = (!isNaN(parseInt(req.query.ems))) ?  parseInt(req.query.ems) : 0;
    var emailQuery = (req.query.emq) ? req.query.emq : '';
    var phoneSort = (!isNaN(parseInt(req.query.phs))) ?  parseInt(req.query.phs) : 0;
    var phoneQuery = (req.query.phq) ? req.query.phq : '';
    var citySort = (!isNaN(parseInt(req.query.cts))) ?  parseInt(req.query.cts): 0;
    var cityQuery = (req.query.ctq) ? req.query.ctq : '';
    var stateSort = (!isNaN(parseInt(req.query.sts))) ?  parseInt(req.query.sts): 0;
    var stateQuery = (req.query.stq) ? req.query.stq : '';
    var countrySort = (!isNaN(parseInt(req.query.cnts))) ?  parseInt(req.query.cnts): 0;
    var countryQuery = (req.query.cntq) ? req.query.cntq : '';
    var statusSort = (!isNaN(parseInt(req.query.stss))) ?  parseInt(req.query.stss): 0;
    var statusQuery = (req.query.stsq) ? req.query.stsq : '';
    var mobileSort = (!isNaN(parseInt(req.query.mns))) ?  parseInt(req.query.mns): 0;
    var mobileQuery = (req.query.mnq) ? req.query.mnq : '';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };

    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'token is mandatory';
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
                        var queryParams =   st.db.escape(token) + ',' + st.db.escape(locId) + ',' + st.db.escape(type)
                            + ',' + st.db.escape(latitude)+ ',' + st.db.escape(longitude)+ ',' + st.db.escape(firstNameSort)
                            + ',' + st.db.escape(firstNameQuery)+ ',' + st.db.escape(lastNameSort)+ ',' + st.db.escape(lastNameQuery)
                            + ',' + st.db.escape(emailSort)+ ',' + st.db.escape(emailQuery)+ ',' + st.db.escape(phoneSort)
                            + ',' + st.db.escape(phoneQuery)+ ',' + st.db.escape(citySort)+ ',' + st.db.escape(cityQuery)
                            + ',' + st.db.escape(stateSort)+ ',' + st.db.escape(stateQuery)+ ',' + st.db.escape(countrySort)
                            + ',' + st.db.escape(countryQuery)+ ',' + st.db.escape(statusSort)+ ',' + st.db.escape(statusQuery)
                            + ',' + st.db.escape(mobileSort)+ ',' + st.db.escape(mobileQuery);
                        var query = 'CALL ploadLOCbasket(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, locBasket) {
                            if (!err) {
                                if (locBasket) {
                                    if(locBasket[0]) {
                                        if (locBasket[0][0]) {
                                            if (locBasket[1]) {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Loc Basket loaded successfully';
                                                responseMessage.data = {
                                                    count: locBasket[0][0].count,
                                                    result: locBasket[1]
                                                };
                                                res.status(200).json(responseMessage);
                                                console.log('FnGetLocBasket: Loc Basket loaded successfully');
                                            }
                                            else {
                                                responseMessage.data = {
                                                    count: 0,
                                                    result: []
                                                };
                                                responseMessage.message = 'Loc Basket not loaded';
                                                res.status(200).json(responseMessage);
                                                console.log('FnGetLocBasket:Loc Basket not loaded');
                                            }
                                        }
                                        else {
                                            responseMessage.data = {
                                                count: 0,
                                                result: []
                                            };
                                            responseMessage.message = 'Loc Basket not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetLocBasket:Loc Basket not loaded');
                                        }
                                    }
                                    else {
                                        responseMessage.data = {
                                            count: 0,
                                            result: []
                                        };
                                        responseMessage.message = 'Loc Basket not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetLocBasket:Loc Basket not loaded');
                                    }
                                }
                                else {
                                    responseMessage.data = {
                                        count: 0,
                                        result: []
                                    };
                                    responseMessage.message = 'Loc Basket not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetLocBasket:Loc Basket not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetLocBasket: error in getting loc basket :' + err);
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
                        console.log('FnGetLocBasket: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetLocBasket:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetLocBasket ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};



module.exports = Loc;
