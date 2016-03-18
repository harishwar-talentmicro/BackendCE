/**
 * Created by Hirecraft on 18-03-2016.
 */
var express = require('express');
var router = express.Router();

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @discription : API to get working hour schedule for business and branches
 * @param tid <int> (TID of login user or TID of branch depending upon whose working hours you want to update
 */
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
module.exports = router;