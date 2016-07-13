/**
 * Created by Hirecraft on 05-07-2016.
 */

var temp = function(res){
    res.send('');
};
var moment = require('moment');
var ScheduleCtrl = {};

ScheduleCtrl.getWorkingHours = function(req,res,next){
    var response = {
        status : false,
        message : "Your session has expired please login to continue",
        data : null,
        error : {
            token : "Token is expired"
        }
    };
    var validationFlag = true;
    var error = {};


    if (isNaN(parseInt(req.query.masterId))){
        response.error = {
            masterId : "Invalid master Id"
        };
        validationFlag *= false;
    }
    if(!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else{
        try {
            if (req.query.token) {
                req.st.validateTokenAp(req.query.token, function (err, tokenResult) {
                    if (!err) {
                        if (tokenResult) {
                            var queryParams = req.db.escape(req.query.masterId);
                            var query = 'CALL get_working_hours_ezeid(' + queryParams + ')';
                            console.log(query);
                            req.db.query(query, function (err, results) {
                                if (!err) {
                                    console.log(results);
                                    if (results) {
                                        if (results[0]) {
                                            if (results[0].length > 0) {
                                                if (!results[0][0].error){
                                                    for(var i = 0; i < results[0].length; i++){
                                                        results[0][i].days = results[0][i].days.split(',');
                                                        for(var j = 0; j < results[0][i].days.length; j++){
                                                            results[0][i].days[j] = parseInt(results[0][i].days[j]);
                                                        }
                                                        /**
                                                         * Code that
                                                         */
                                                        results[0][i].et = (((parseInt(results[0][i].et) / 60) < 10) ?
                                                            '0'+(parseInt(results[0][i].et / 60)).toString() :
                                                                parseInt(results[0][i].et / 60)) + ':'+
                                                            (((results[0][i].et % 60) < 10) ?
                                                            '0'+(results[0][i].et % 60).toString() :
                                                                parseInt(results[0][i].et % 60));

                                                        results[0][i].st = (((parseInt(results[0][i].st) / 60) < 10) ?
                                                            '0'+(parseInt(results[0][i].st / 60)).toString() :
                                                                parseInt(results[0][i].st / 60)) + ':'+
                                                            (((results[0][i].st % 60) < 10) ?
                                                            '0'+(results[0][i].st % 60).toString() :
                                                                parseInt(results[0][i].st % 60));
                                                    }
                                                    response.status = true;
                                                    response.data = results[0];
                                                    response.error = null;
                                                    response.message = ' working schedule Send successfully';
                                                    res.status(200).json(response);
                                                }
                                                else {
                                                    response.message = 'working schedule are not sent';
                                                    response.status = true;
                                                    res.json(response);
                                                }

                                            }
                                            else {
                                                response.message = 'working schedule are not sent';
                                                response.status = true;
                                                res.json(response);
                                            }
                                        }
                                        else {
                                            response.message = 'working schedule are not sent';
                                            res.json(response);
                                        }
                                    }
                                    else {
                                        response.message = 'working schedule are not sent';
                                        res.json(response);
                                    }

                                }
                                else {
                                    response.data = null;
                                    response.message = 'Error in getting working schedule';
                                    console.log('getInstituteConfig: Error in getting working schedule' + err);
                                    res.status(500).json(response);
                                }
                            });
                        }
                        else {
                            response.message = 'Invalid token';
                            response.error = {
                                token: 'Invalid Token'
                            };
                            response.data = null;
                            res.status(401).json(response);
                            console.log('getInstituteConfig: Invalid token');
                        }
                    }
                    else {
                        response.error = {
                            server: 'Internal Server Error'
                        };
                        response.message = 'Error in validating Token';
                        res.status(500).json(response);
                        console.log('getInstituteConfig:Error in processing Token' + err);
                    }
                });
            }

            else {
                if (!req.query.token) {
                    response.message = 'Invalid Token';
                    response.error = {
                        Token : 'Invalid Token'
                    };
                    console.log('getInstituteConfig: Token is mandatory field');
                }

                res.status(401).json(response);
            }
        }
        catch (ex) {
            response.error = {};
            response.message = 'An error occured !';
            console.log('getInstituteConfig:error ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(400).json(response);
        }
    }
};

ScheduleCtrl.saveWorkingHours = function(req,res,next){
    if(req.is('json')){
        try{
            var dataFromClient = req.body;
            var error = {
            };
            var validationFlag = true;

            /**
             * TID of tmaster wherer you want to update working hours schedule
             * It can be main business TID or it can be a branch TID (i.e. also in tmaster but pointing to some other TID which is it's parent)
             */
            req.query.masterId = parseInt(req.query.masterId);
            if(isNaN(req.query.masterId) || req.query.masterId < 1){
                validationFlag *= false;
                error['masterId'] = "Invalid TID";
            }

            /**
             * Slots which should not be deleted for working hours
             */
            var excludedIdList = [];

            var combSaveQuery = "";
            for(var i = 0; i < dataFromClient.length; i++){
                var startMoment = moment(dataFromClient[i].st,"HH:mm");
                var endMoment = moment(dataFromClient[i].et,"HH:mm");
                error[i] = null;

                /**
                 * Validating start time
                 */
                if(startMoment){
                    if(!startMoment.isValid()){
                        error[i] = { st : 'Invalid time format'};
                        validationFlag *= false;
                    }
                }
                else{
                    error[i] = { st : 'Invalid time format'};
                    validationFlag *= false;
                }
                /**
                 * Validating end time
                 */
                if(endMoment){
                    if(!endMoment.isValid()){
                        error[i] = { et : 'Invalid time format'};
                        validationFlag *= false;
                    }
                }
                else{
                    error[i] = { et : 'Invalid time format'};
                    validationFlag *= false;
                }

                /**
                 * Validating days
                 */
                if(dataFromClient[i].days){
                    if(dataFromClient[i].days.length < 1) {
                        error[i] = {days: 'Days are empty'};
                        validationFlag *= false;
                    }
                    else{
                        for(var j = 0; j < dataFromClient[i].days.length; j++){
                            dataFromClient[i].days[j] = parseInt(dataFromClient[i].days[j]);
                            if(dataFromClient[i].days[j] > 6 || dataFromClient[i].days[j] < 0 || isNaN(dataFromClient[i].days[j])){
                                if(dataFromClient[i].days[j] > 6){
                                    dataFromClient[i].days[j] = dataFromClient[i].days[j] % 6;
                                }
                                if(isNaN(dataFromClient[i].days[j]) || dataFromClient[i].days[j] < 0){
                                    dataFromClient[i].days.splice(j,1);
                                }
                            }
                        }

                        if(!dataFromClient[i].days.length){
                            error[i] = { days : 'Days are empty'};
                            validationFlag *= false;
                        }
                    }
                }
                else {
                    error[i] = { days : 'Days are empty'};
                    validationFlag *= false;
                }
                dataFromClient[i].id = parseInt(dataFromClient[i].id);
                if(isNaN(dataFromClient[i].id) || dataFromClient[i].id < 0){
                    error[i] = { days : 'Invalid slot id'};
                    validationFlag *= false;
                }

                if(error[i]){
                    continue;
                }

                //if(dataFromClient[i].id){
                //    excludedIdList.push(dataFromClient[i].id);
                //}

                var queryParams = [
                    req.db.escape(req.query.token),
                    req.db.escape(dataFromClient[i].id),
                    req.db.escape(dataFromClient[i].days.join(',')),
                    req.db.escape((startMoment.hours() * 60)+startMoment.minutes()),
                    req.db.escape((endMoment.hours() * 60)+endMoment.minutes()),
                    req.db.escape(req.db.escape(req.query.masterId))
                ];

                combSaveQuery += "CALL post_working_hour_AP("+ queryParams.join(',')+");";

            }
            //console.log("combSaveQuery1",combSaveQuery);
            /**
             * The slots which are not to be deleted are pushed into excluded list
             */

            //var delQueryParams = [
            //    req.db.escape(req.query.token),
            //    req.db.escape(excludedIdList.join(',')),
            //    req.db.escape(req.db.escape(req.query.masterId))
            //];
            ///**
            // * The slots other than the passed slots will get deleted with this procedure
            // */
            //combSaveQuery = "CALL delete_working_hours_AP("+ delQueryParams.join(',')+");"  + combSaveQuery;
            console.log("combSaveQuery",combSaveQuery);
            if(!validationFlag){
                res.status(200).json({
                    status : false,
                    message : "Please check the errors",
                    error : error,
                    data : null
                });
            }
            else{
                req.db.query(combSaveQuery,function(err,results){
                    if(err){
                        console.log('Error ',' In saving new working hours slot');
                        console.log('Error message',err);
                        res.status(500).json({
                            status: false,
                            message : 'Internal Server error',
                            error : {
                                server : 'Internal Server error'
                            },
                            data : null
                        });
                    }
                    else{
                        console.log(results);
                        if(results.length > 2){
                            results.splice(0,1);
                            for(var i=0; i < results.length; i++){
                                if((i%2) == 0){
                                    console.log('results[i]',results[i]);
                                    console.log('results[i][0]',results[i][0]);
                                    if(results[i][0]){
                                        if(results[i][0].id){
                                            dataFromClient[(i/2)].id = results[i][0].id;
                                        }
                                        else{
                                            dataFromClient.splice(i/2,1);
                                        }
                                    }

                                }
                            }
                        }

                        res.status(200).json({
                            status : true,
                            message : "Working hours updated successfully",
                            error : null,
                            data : dataFromClient
                        });

                    }
                });
            }
        }
        catch(ex){
            console.log('Exception error ',' In saving new working hours slot');
            console.log('Exception message',ex);
            res.status(500).json({
                status: false,
                message : 'Internal Server error',
                error : {
                    server : 'Internal Server error'
                },
                data : null
            });
        }
    }
    else{
        res.status(400).json({
            status: false,
            message : 'Incompatible data type (JSON only supported)',
            data : null,
            error : {
                server : 'Incompatible data type'
            }
        });
    }
};

ScheduleCtrl.getHolidayList = function(req,res,next){
    var response = {
        status : false,
        message : "Your session has expired please login to continue",
        data : null,
        error : {
            token : "Token is expired"
        }
    };
    var error = {};
    try {
        /**
         * validating token
         * */
        req.st.validateTokenAp(req.query.token, function (err, tokenResult) {
            if (!err) {
                if (tokenResult) {
                    /**
                     * getting holiday template list
                     * */
                    var queryParams = req.db.escape(req.query.masterId);
                    var query = 'CALL pGetHolidayList(' + queryParams + ')';
                    console.log(query);
                    req.db.query(query, function (err, results) {
                        if (!err) {
                            console.log(results);

                            if (results && results[0] && results[0].length > 0) {

                                response.status = true;
                                response.data = results[0];
                                response.error = null;
                                response.message = 'Holiday list loaded successfully';
                                res.status(200).json(response);

                            }
                            else {
                                response.message = 'Holiday list are not available';
                                res.json(response);
                            }

                        }
                        else {
                            response.data = null;
                            response.message = 'Error in getting Holiday template List';
                            console.log('pGetHolidayList: Error in getting Holiday template List' + err);
                            res.status(500).json(response);
                        }
                    });
                }
                else {
                    response.message = 'Invalid token';
                    response.error = {
                        token: 'Invalid Token'
                    };
                    response.data = null;
                    res.status(401).json(response);
                    console.log('pGetHolidayList: Invalid token');
                }
            }
            else {
                response.error = {
                    server: 'Internal Server Error'
                };
                response.message = 'Error in validating Token';
                res.status(500).json(response);
                console.log('pGetHolidayList:Error in processing Token' + err);
            }
        });
    }
    catch (ex) {
        response.error = {};
        response.message = 'An error occured !';
        console.log('pGetHolidayList:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(response);
    }
};

ScheduleCtrl.saveHolidayList = function(req,res,next){
    if(req.is('json')){
        try{

            var dataFromClient = req.body;
            var error = {
            };
            var validationFlag = true;

            req.query.masterId = parseInt(req.query.masterId);
            if(isNaN(req.query.masterId) || req.query.masterId < 1){
                validationFlag *= false;
                error['masterId'] = "Invalid TID";
            }

            var excludedIdList = [];

            var combSaveQuery = "";
            for(var i = 0; i < dataFromClient.length; i++){
                var dateMoment = moment(dataFromClient[i].date,"YYYY MM DD");
                error[i] = null;

                /**
                 * Validating date
                 */
                if(dateMoment){
                    if(!dateMoment.isValid()){
                        error[i] = { date : 'Invalid date format'};
                        validationFlag *= false;
                    }
                }
                else{
                    error[i] = { date : 'Invalid date format'};
                    validationFlag *= false;
                }


                //dataFromClient[i].holidayId = parseInt(dataFromClient[i].holidayId);
                //if(isNaN(dataFromClient[i].holidayId) || dataFromClient[i].holidayId < 0){
                //    error[i] = { holidayId : 'Invalid holiday id'};
                //    validationFlag *= false;
                //}

                if(error[i]){
                    continue;
                }
                //dataFromClient[i].holidayId = (dataFromClient[i].holidayId) ? dataFromClient[i].holidayId : 0;
                var queryParams = [
                    req.db.escape(0),
                    req.db.escape(req.query.masterId),
                    req.db.escape(dateMoment.format('YYYY-MM-DD')),
                    req.db.escape(dataFromClient[i].title),

                ];
                console.log(queryParams);
                combSaveQuery += "CALL psaveholidaycalendar_ezeone_ap ("+ queryParams.join(',') +");";

            }

            if(!validationFlag){
                res.status(200).json({
                    status : false,
                    message : "Please check the errors",
                    error : error,
                    data : null
                });
            }
            else{
                req.db.query(combSaveQuery,function(err,results){
                    if(err){
                        console.log('Error ',' In saving new holiday list');
                        console.log('Error message',err);
                        res.status(500).json({
                            status: false,
                            message : 'Internal Server error',
                            error : {
                                server : 'Internal Server error'
                            },
                            data : null
                        });
                    }
                    else{
                        res.status(200).json({
                            status : true,
                            message : "holiday list updated successfully",
                            error : null,
                            data : dataFromClient
                        });

                    }
                });
            }
        }
        catch(ex){
            console.log('Exception error ',' In saving new holiday list');
            console.log('Exception message',ex);
            res.status(500).json({
                status: false,
                message : 'Internal Server error',
                error : {
                    server : 'Internal Server error'
                },
                data : null
            });
        }
    }
    else{
        res.status(400).json({
            status: false,
            message : 'Incompatible data type (JSON only supported)',
            data : null,
            error : {
                server : 'Incompatible data type'
            }
        });
    }
};

ScheduleCtrl.getHolidayTplListOLD = function(req,res,next){
    var response = {
        status : false,
        message : "Your session has expired please login to continue",
        data : null,
        error : {
            token : "Token is expired"
        }
    };
    var error = {};
    try {
        /**
         * validating token
         * */
        req.st.validateTokenAp(req.query.token, function (err, tokenResult) {
            if (!err) {
                if (tokenResult) {
                    /**
                     * getting holiday template list
                     * */
                    var queryParams = req.db.escape(req.query.token);
                    var query = 'CALL Pget_holiday_template_list(' + queryParams + ')';
                    console.log(query);
                    req.db.query(query, function (err, results) {
                        if (!err) {
                            console.log(results);
                            var outputArray = [];
                            /**
                             * preparing json object by comparing template id from 2 array set got from database
                             * */
                            if (results && results[0] && results[0].length > 0) {
                                for (var i = 0; i < results[0].length; i++) {
                                    var tempObj={
                                        id:results[0][i].tid,
                                        title:results[0][i].title
                                    };
                                    var tempArray=[];

                                    for (var j = 0; j < results[1].length; j++) {
                                        if (results[0][i].tid == results[1][j].templateId) {
                                            tempArray.push(results[1][j]);
                                        }
                                    }
                                    tempObj.holidayList= tempArray;
                                    outputArray.push(tempObj);
                                }
                                //console.log(outputArray,"outputArray");
                                response.status = true;
                                response.data = outputArray;
                                response.error = null;
                                response.message = 'Holiday template list loaded successfully';
                                res.status(200).json(response);

                            }
                            else {
                                response.message = 'Holiday template list are not available';
                                res.json(response);
                            }

                        }
                        else {
                            response.data = null;
                            response.message = 'Error in getting Holiday template List';
                            console.log('Pget_holiday_template_list: Error in getting Holiday template List' + err);
                            res.status(500).json(response);
                        }
                    });
                }
                else {
                    response.message = 'Invalid token';
                    response.error = {
                        token: 'Invalid Token'
                    };
                    response.data = null;
                    res.status(401).json(response);
                    console.log('Pget_holiday_template_list: Invalid token');
                }
            }
            else {
                response.error = {
                    server: 'Internal Server Error'
                };
                response.message = 'Error in validating Token';
                res.status(500).json(response);
                console.log('Pget_holiday_template_list:Error in processing Token' + err);
            }
        });
    }
    catch (ex) {
        response.error = {};
        response.message = 'An error occured !';
        console.log('Pget_holiday_template_list:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(response);
    }
};

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description This will fetch all the templates
 * @accepts json
 *
 * @param token <string> token of login user
 *
 */
ScheduleCtrl.getTemplateList = function(req,res,next){
    var response = {
        status : false,
        message : "Your session has expired please login to continue",
        data : null,
        error : {
            token : "Token is expired"
        }
    };
    var error = {};
    try {
        /**
         * validating token
         * */
        req.st.validateTokenAp(req.query.token, function (err, tokenResult) {
            if (!err) {
                if (tokenResult) {
                    /**
                     * getting list of all template
                     */
                    var queryParams = req.db.escape(req.query.token);
                    var query = 'CALL Pget_holiday_template_list(' + queryParams + ')';
                    console.log(query);
                    req.db.query(query, function (err, results) {
                        if (!err) {
                            console.log(results);
                            if (results && results[0] && results[0].length > 0) {

                                response.status = true;
                                response.data = {
                                    templateList : results[0]
                                };
                                response.error = null;
                                response.message = 'Template list loaded successfully';
                                res.status(200).json(response);

                            }
                            else {
                                response.message = 'Template list are not available';
                                res.json(response);
                            }

                        }
                        else {
                            response.data = null;
                            response.message = 'Error in getting Holiday template List';
                            console.log('Pget_holiday_template_list: Error in getting Template List' + err);
                            res.status(500).json(response);
                        }
                    });
                }
                else {
                    response.message = 'Invalid token';
                    response.error = {
                        token: 'Invalid Token'
                    };
                    response.data = null;
                    res.status(401).json(response);
                    console.log('Pget_holiday_template_list: Invalid token');
                }
            }
            else {
                response.error = {
                    server: 'Internal Server Error'
                };
                response.message = 'Error in validating Token';
                res.status(500).json(response);
                console.log('Pget_holiday_template_list:Error in processing Token' + err);
            }
        });
    }
    catch (ex) {
        response.error = {};
        response.message = 'An error occured !';
        console.log('Pget_holiday_template_list:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(response);
    }
};

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description  Load the selected template details
 * @accepts json
 *
 * @param token <string> token of login user
 * @param templateId <int> tid of template
 *
 */
ScheduleCtrl.getTemplateDetails = function(req,res,next){
    var response = {
        status : false,
        message : "Your session has expired please login to continue",
        data : null,
        error : {
            token : "Token is expired"
        }
    };
    var error = {};
    try {
        /**
         * validating token
         * */
        req.st.validateTokenAp(req.query.token, function (err, tokenResult) {
            if (!err) {
                if (tokenResult) {
                    /**
                     * geting details of template (geting list of holidays and working hours)
                     * @type {*[]}
                     */
                    var queryParams = [req.db.escape(req.query.token),req.db.escape(req.query.templateId)];
                    var query = 'CALL ploadholidaytemplate_details_ap(' + queryParams.join(',') + ')';
                    console.log(query);
                    req.db.query(query, function (err, results) {
                        if (!err) {
                            console.log(results);
                            if (results && results.length) {
                                if (results[1]){
                                    /**
                                     * converting comma saprated day id's into
                                     * array of day id's
                                     */
                                    for(var i = 0; i < results[1].length; i++){
                                        results[1][i].days = results[1][i].days.split(',');

                                        for(var j = 0; j < results[1][i].days.length; j++){
                                            results[1][i].days[j] = parseInt(results[1][i].days[j]);
                                        }
                                        /**
                                         * converting seconds into hours of start time
                                         * and time of working hours
                                         */

                                        results[1][i].et = (((parseInt(results[1][i].et) / 60) < 10) ?
                                            '0'+(parseInt(results[1][i].et / 60)).toString() :
                                                parseInt(results[1][i].et / 60)) + ':'+
                                            (((results[1][i].et % 60) < 10) ?
                                            '0'+(results[1][i].et % 60).toString() :
                                                parseInt(results[1][i].et % 60));

                                        results[1][i].st = (((parseInt(results[1][i].st) / 60) < 10) ?
                                            '0'+(parseInt(results[1][i].st / 60)).toString() :
                                                parseInt(results[1][i].st / 60)) + ':'+
                                            (((results[1][i].st % 60) < 10) ?
                                            '0'+(results[1][i].st % 60).toString() :
                                                parseInt(results[1][i].st % 60));
                                    }
                                }

                                response.status = true;
                                response.data = {
                                    holidayList : results[0],
                                    workingHourList : results[1]
                                };
                                response.error = null;
                                response.message = 'Template details loaded successfully';
                                res.status(200).json(response);

                            }
                            else {
                                response.message = 'Template details are not available';
                                res.json(response);
                            }

                        }
                        else {
                            response.data = null;
                            response.message = 'Error in getting Holiday template Details';
                            console.log('Pploadholidaytemplate_details_ap: Error in getting Template Details' + err);
                            res.status(500).json(response);
                        }
                    });
                }
                else {
                    response.message = 'Invalid token';
                    response.error = {
                        token: 'Invalid Token'
                    };
                    response.data = null;
                    res.status(401).json(response);
                    console.log('ploadholidaytemplate_details_ap: Invalid token');
                }
            }
            else {
                response.error = {
                    server: 'Internal Server Error'
                };
                response.message = 'Error in validating Token';
                res.status(500).json(response);
                console.log('ploadholidaytemplate_details_ap:Error in processing Token' + err);
            }
        });
    }
    catch (ex) {
        response.error = {};
        response.message = 'An error occured !';
        console.log('ploadholidaytemplate_details_ap:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(response);
    }
};

/**
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description  Save template
 * @accepts json
 *
 * @param token <string> token of login user
 * @param title <string> title of template
 * @param templateId <int> tid of template (0 for saving)
 * @param holidayList <array>
 * @param workingHourList <array>
 *
 */
ScheduleCtrl.saveTemplate = function(req,res,next){
    console.log(req.body);
    if(req.is('json')){
       var response = {
           status : false,
           message : "",
           data : null,
           error : {

           }
       };
       var error = {};
        var validationFlag = false;

        try {
            req.body.templateId = (req.body.templateId) ? req.body.templateId : 0;
           var holidayList = (req.body.holidayList) ? req.body.holidayList : [];
           var workingHourList = (req.body.workingHourList) ? req.body.workingHourList : [];
           var excludedIdList = [];
           /**
            * validating token
            * */
           req.st.validateTokenAp(req.query.token, function (err, tokenResult) {
               if (!err) {
                   if (tokenResult) {
                       /**
                        * saving template
                        * */
                       var queryParams = [req.db.escape(req.query.token),req.db.escape(req.body.templateId),
                           req.db.escape(req.body.title)];
                       var query = 'CALL psaveholiday_template_ap(' + queryParams.join(',') + ')';
                       console.log(query);
                       req.db.query(query, function (err, results) {
                           if (!err) {
                               console.log(results);
                               var combSaveBigQuery = '';
                               var combSaveHolidayQuery = '';
                               var combSaveWorkingHoureQuery = '';
                               if (results && results[0] && results[0][0] && results[0][0].id) {
                                   if ( holidayList.length || workingHourList.length){
                                       /**
                                        * preparing query statement for saving holiday list
                                        */
                                       for ( var j = 0; j < holidayList.length; j++){
                                           var queryParams = [
                                               req.db.escape(req.query.token),
                                               req.db.escape(holidayList[j].date),
                                               req.db.escape(holidayList[j].title),
                                               req.db.escape(results[0][0].id),
                                           ];

                                           combSaveHolidayQuery += "CALL psaveholidaycalendar_ap("+ queryParams.join(',')+");";
                                       }

                                       /**
                                        * preparing query statment for saving working hour list
                                        */
                                       for ( var i = 0; i < workingHourList.length; i++){
                                           var startMoment = moment(workingHourList[i].st,"HH:mm");
                                           var endMoment = moment(workingHourList[i].et,"HH:mm");
                                           error[i] = null;

                                           /**
                                            * Validating start time
                                            */
                                           if(startMoment){
                                               if(!startMoment.isValid()){
                                                   error[i] = { st : 'Invalid time format'};
                                                   validationFlag *= false;
                                               }
                                           }
                                           else{
                                               error[i] = { st : 'Invalid time format'};
                                               validationFlag *= false;
                                           }
                                           /**
                                            * Validating end time
                                            */
                                           if(endMoment){
                                               if(!endMoment.isValid()){
                                                   error[i] = { et : 'Invalid time format'};
                                                   validationFlag *= false;
                                               }
                                           }
                                           else{
                                               error[i] = { et : 'Invalid time format'};
                                               validationFlag *= false;
                                           }

                                           /**
                                            * Validating days
                                            */
                                           if(workingHourList[i].days){
                                               if(workingHourList[i].days.length < 1) {
                                                   error[i] = {days: 'Days are empty'};
                                                   validationFlag *= false;
                                               }
                                               else{

                                                   for(var j = 0; j < workingHourList[i].days.length; j++){
                                                       workingHourList[i].days[j] = parseInt(workingHourList[i].days[j]);
                                                       if(workingHourList[i].days[j] > 6 || workingHourList[i].days[j] < 0 || isNaN(workingHourList[i].days[j])){
                                                           if(workingHourList[i].days[j] > 6){
                                                               workingHourList[i].days[j] = workingHourList[i].days[j] % 6;
                                                           }
                                                           if(isNaN(workingHourList[i].days[j]) || workingHourList[i].days[j] < 0){
                                                               workingHourList[i].days.splice(j,1);
                                                           }
                                                       }
                                                   }

                                                   if(!workingHourList[i].days.length){
                                                       error[i] = { days : 'Days are empty'};
                                                       validationFlag *= false;
                                                   }
                                               }
                                           }
                                           else {
                                               error[i] = { days : 'Days are empty'};
                                               validationFlag *= false;
                                           }
                                           //workingHourList[i].id = parseInt(workingHourList[i].id);
                                           //if(isNaN(workingHourList[i].id) || workingHourList[i].id < 0){
                                           //    error[i] = { days : 'Invalid slot id'};
                                           //    validationFlag *= false;
                                           //}

                                           if(error[i]){
                                               continue;
                                           }

                                           //if(workingHourList[i].id){
                                           //    excludedIdList.push(workingHourList[i].id);
                                           //}
                                           /**
                                            * converting stat time and end time hours in minuts
                                            * @type {*[]}
                                            */
                                           var queryParams = [
                                               req.db.escape(req.query.token),
                                               req.db.escape(workingHourList[i].days.join(',')),
                                               req.db.escape((startMoment.hours() * 60)+startMoment.minutes()),
                                               req.db.escape((endMoment.hours() * 60)+endMoment.minutes()),
                                               req.db.escape(results[0][0].id)
                                           ];

                                           combSaveWorkingHoureQuery += "CALL PSaveworkinghourstemplatedetails_ap("+ queryParams.join(',')+");";

                                       }
                                       /**
                                        * combining holiday list query and working hour query and exicuting
                                        * @type {string}
                                        */
                                       combSaveBigQuery = combSaveHolidayQuery + combSaveWorkingHoureQuery;
                                       console.log("combSaveWorkingHoureQuery",combSaveWorkingHoureQuery);
                                       console.log("combSaveHolidayQuery",combSaveHolidayQuery);
                                       console.log(combSaveBigQuery);
                                       req.db.query(combSaveBigQuery, function (err, templateResults) {

                                           if(!err){
                                               console.log(templateResults);
                                               if (templateResults){
                                                   response.status = true;
                                                   response.data = {
                                                       templateId : results[0][0].id
                                                   };
                                                   response.error = null;
                                                   response.message = 'Template saved successfully';
                                                   res.status(200).json(response);
                                               }
                                               else {
                                                   response.message = 'Error while saving holiday list or working hour list';
                                                   res.json(response);
                                               }
                                           }
                                           else {
                                               response.message = 'Error while saving holiday list or working hour list';
                                               res.json(response);
                                           }

                                       });
                                   }
                                   else {
                                       response.status = true;
                                       response.data = {
                                           templateId : results[0][0].id
                                       };
                                       response.error = null;
                                       response.message = 'Template saved successfully';
                                       res.status(200).json(response);
                                   }
                               }
                               else {
                                   response.message = 'Holiday template details are not available';
                                   res.json(response);
                               }

                           }
                           else {
                               response.data = null;
                               response.message = 'Error in getting Holiday template Details';
                               console.log('Pploadholidaytemplate_details_ap: Error in getting Holiday template Details' + err);
                               res.status(500).json(response);
                           }
                       });
                   }
                   else {
                       response.message = 'Invalid token';
                       response.error = {
                           token: 'Invalid Token'
                       };
                       response.data = null;
                       res.status(401).json(response);
                       console.log('ploadholidaytemplate_details_ap: Invalid token');
                   }
               }
               else {
                   response.error = {
                       server: 'Internal Server Error'
                   };
                   response.message = 'Error in validating Token';
                   res.status(500).json(response);
                   console.log('ploadholidaytemplate_details_ap:Error in processing Token' + err);
               }
           });
       }
       catch (ex) {
           response.error = {};
           response.message = 'An error occured !';
           console.log('ploadholidaytemplate_details_ap:error ' + ex);
           var errorDate = new Date();
           console.log(errorDate.toTimeString() + ' ......... error ...........');
           res.status(400).json(response);
       }
   }
    else {
       res.status(400).json({
           status: false,
           message : 'Incompatible data type (JSON only supported)',
           data : null,
           error : {
               server : 'Incompatible data type'
           }
       });
   }
};


module.exports = ScheduleCtrl;