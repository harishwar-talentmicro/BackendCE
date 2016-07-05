/**
 * Created by Hirecraft on 05-07-2016.
 */

var temp = function(res){
    res.send('');
};

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
            /**
             * Sample data structure you will get from Client(Web)
             * It will be accessible through req.body and req type will always be json
             */
            //var dataFromClient = [
            //    {
            //        id : 0,
            //        days : [0,1,2],
            //        st : "09:00",
            //        et : "19:00"
            //    },
            //    {
            //        id : 0,
            //        days : [0,1,3],
            //        st : "10:00",
            //        et : "13:00"
            //    }
            //];

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

                if(dataFromClient[i].id){
                    excludedIdList.push(dataFromClient[i].id);
                }

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

            var delQueryParams = [
                req.db.escape(req.query.token),
                req.db.escape(excludedIdList.join(',')),
                req.db.escape(req.db.escape(req.query.masterId))
            ];
            /**
             * The slots other than the passed slots will get deleted with this procedure
             */
            combSaveQuery = "CALL delete_working_hours_AP("+ delQueryParams.join(',')+");"  + combSaveQuery;
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
    temp(res);
};
ScheduleCtrl.saveHolidayList = function(req,res,next){
    temp(res);
};

ScheduleCtrl.getHolidayTemplate = function(req,res,next){
    temp(res);
};
module.exports = ScheduleCtrl;