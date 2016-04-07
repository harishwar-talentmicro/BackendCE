/**
 * Created by Hirecraft on 18-03-2016.
 */
var express = require('express');
var router = express.Router();
var request = require('request');
/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @discription :
 */
router.get('/tag/:tag', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if (isNaN(parseInt(req.query.tid))){
        error.tid = 'Invalid master id';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else{
        try {
            var queryParams = req.db.escape(req.query.tid)+ ',' + req.db.escape(req.params.tag);
            var query = 'CALL get_tag(' + queryParams + ')';
            console.log(query);
            req.db.query(query, function (err, results) {
                if (!err) {
                    console.log(results);
                    if (results && results[0] && results[0][0] && results[0][0].image) {
                        responseMessage.status = true;
                        results[0][0].GS_URL = req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET;
                        responseMessage.data = results[0];
                        responseMessage.error = null;
                        responseMessage.message = ' tag result loaded successfully';
                        res.status(200).json(responseMessage);
                    }
                    else {
                        responseMessage.message = 'No data available';
                        res.json(responseMessage);
                    }

                }
                else {
                    responseMessage.data = null;
                    responseMessage.message = 'Error in getting tag results';
                    console.log('getInstituteConfig: Error in getting tag results' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {};
            responseMessage.message = 'An error occured !';
            console.log('get_tag:error ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(400).json(responseMessage);
        }
    }
});


router.get('/working_schedule', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if (isNaN(parseInt(req.query.tid))){
        error.tid = 'Invalid tid';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else{
        try {
            var queryParams = req.db.escape(req.query.tid);
            var query = 'CALL get_working_hours_ezeid(' + queryParams + ')';
            console.log(query);
            req.db.query(query, function (err, results) {
                if (!err) {
                    console.log(results);
                    if (results) {
                        if (results[0]) {
                            if (results[0].length > 0) {
                                for(var i = 0; i < results[0].length; i++){
                                    results[0][i].days = results[0][i].days.split(',');
                                    for(var j = 0; j < results[0][i].days.length; j++){
                                        results[0][i].days[j] = parseInt(results[0][i].days[j]);
                                    }
                                    /**
                                     * Code that minuts in hour format
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
                                responseMessage.status = true;
                                responseMessage.data = results[0];
                                responseMessage.error = null;
                                responseMessage.message = ' working schedule Send successfully';
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.message = 'working schedule are not sent';
                                responseMessage.status = true;
                                res.json(responseMessage);
                            }
                        }
                        else {
                            responseMessage.message = 'working schedule are not sent';
                            res.json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.message = 'working schedule are not sent';
                        res.json(responseMessage);
                    }

                }
                else {
                    responseMessage.data = null;
                    responseMessage.message = 'Error in getting working schedule';
                    console.log('getInstituteConfig: Error in getting working schedule' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {};
            responseMessage.message = 'An error occured !';
            console.log('getInstituteConfig:error ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(400).json(responseMessage);
        }
    }
});


router.get('/testbhavya',function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    //try {
        var id = parseInt(req.query.id);
        //var ownerId = req.query.owner_id;   // id=masterid when ownerid=0 and id=jobid when ownerid!=0

        var responseMessage = {
            status: false,
            data: null,
            skillMatrix : [],
            job_location : [],
            line_of_career : [],
            education : [],
            error:{},
            message:''
        };

        if (id) {
            console.log(id);
            var queryParams = req.db.escape(req.query.id);
            var query = 'CALL pgetCVInfo(' + queryParams + ')';
            console.log(query);
            req.db.query(query, function (err, MessagesResult) {
                request('http://104.199.128.226:3001/api/v1.1/info/working_schedule?tid=1241', function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log(body) // Print
                    }
                })
                if (!err) {
                    if(MessagesResult) {
                        if (MessagesResult[0]) {
                            if (MessagesResult[0][0]) {
                                MessagesResult[0][0].CVDocpath = (MessagesResult[0][0].CVDocpath) ?
                                    (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + MessagesResult[0][0].CVDocpath) : '';
                            }
                            responseMessage.status = true;
                            responseMessage.data = MessagesResult[0];
                            responseMessage.skillMatrix = MessagesResult[1];
                            responseMessage.job_location = MessagesResult[2];
                            responseMessage.line_of_career = MessagesResult[3];
                            responseMessage.education = MessagesResult[4];
                            responseMessage.error = null;
                            responseMessage.message = 'Cv info send successfully';
                            res.status(200).json(responseMessage);
                            console.log('FnGetCVInfo: CV Info sent successfully');
                        }
                        else {
                            console.log('FnGetCVInfo: No CV Info  available');
                            responseMessage.message = 'Cv info not send successfully';
                            res.json(responseMessage);
                        }
                    }
                    else {
                        console.log('FnGetCVInfo: No CV Info  available');
                        responseMessage.message = 'Cv info not send successfully';
                        res.json(responseMessage);
                    }
                }
                else {
                    console.log('FnGetCVInfo: Error in sending Messages: ' + err);
                    responseMessage.message = 'Error in sending CV info';
                    res.status(500).json(responseMessage);
                }
            });
        }
        else {

            console.log('FnGetCVInfo: id is empty');
            responseMessage.message = 'id is empty';
            res.status(400).json(responseMessage);
        }
    //}
    //catch (ex) {
    //    var errorDate = new Date();
    //    console.log(errorDate.toTimeString() + ' ......... error ...........');
    //    console.log('FnGetCVInfo error:' + ex.description);
    //
    //    res.status(400).json(responseMessage);
    //}
});

module.exports = router;