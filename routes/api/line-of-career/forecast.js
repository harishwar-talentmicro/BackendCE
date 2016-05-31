/**
 * Created by Hirecraft on 26-05-2016.
 */
var express = require('express');
var router = express.Router();
var moment = require('moment');

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @param token* <string> token of login user
 * @param groupId <int>
 * @discription : API to join group(members will call this api)
 */

router.post('/', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(req.is('json')){
        if (!req.body.token) {
            error.token = 'Invalid token';
            validationFlag *= false;
        }
        var locMap = req.body.loc;
        if(!locMap){
            locMap = [];
        }
        req.body.tids = (req.body.tids) ? (req.body.tids) : '';
        if (!validationFlag) {
            responseMessage.error = error;
            responseMessage.message = 'Please check the errors';
            res.status(400).json(responseMessage);
            console.log(responseMessage);
        }
        else {
            try {
                /**
                 * validating token of login user
                 * */

                req.st.validateToken(req.body.token, function (err, tokenResult) {
                    if ((!err) && tokenResult) {

                        var queryParams = [
                            req.db.escape(req.body.tids) ,
                            req.db.escape(req.body.token) ,
                            req.db.escape(req.body.type)
                        ];
                        var query = 'CALL pdeletelocmap(' + queryParams + ')';

                        req.db.query(query, function (err, deleteResult) {
                            if (!err) {

                                var comSaveLocQuery = "";
                                for (var i = 0; i < locMap.length; i++) {
                                    //console.log("locMap :"+locMap);
                                    var locDetails = {
                                        // fid: locMap[i].fid,
                                        locId: locMap[i].career_id,
                                        tid: locMap[i].tid,
                                        internshipCount: locMap[i].interns_count,
                                        fresherCtc: locMap[i].fresher_ctc,
                                        fresherCount: locMap[i].fresher_count,
                                        lateralCount: locMap[i].lateral_count,
                                        type: locMap[i].type
                                    };
                                    console.log("locDetails :"+locDetails);

                                    var query = 'CALL pSaveLocMap(' + req.db.escape(req.body.token) + ',' + req.db.escape(locDetails.locId) + ',' + req.db.escape(locDetails.type)
                                        + ',' + req.db.escape(locDetails.internshipCount) + ',' + req.db.escape(locDetails.fresherCtc)
                                        + ',' + req.db.escape(locDetails.fresherCount) + ',' + req.db.escape(locDetails.lateralCount)
                                        + ',' + req.db.escape(locDetails.tid) + ');';
                                    comSaveLocQuery += query;
                                   // console.log(comSaveLocQuery);
                                }
                                if(comSaveLocQuery){
                                    req.db.query(comSaveLocQuery, function (err, insertResult) {
                                        if (!err) {
                                            //console.log(insertResult);
                                            if (insertResult) {
                                                var outputArray=[];
                                                //id = insertResult[0][0] ? insertResult[0][0].id : 0;
                                                for(var i=0;i<insertResult.length/2;i++){
                                                    var result = {};
                                                    var count = (i) ? 2 * i : 0;

                                                    result.tid = insertResult[count][0].id;
                                                    outputArray.push(result);
                                                }
                                                //console.log(locMap,"locMap");

                                               // outputArray[1].career_id = locMap[1].career_id;
                                                for (var j = 0; j < locMap.length; j++) {
                                                    outputArray[j].career_id = locMap[j].career_id;
                                                    outputArray[j].type = locMap[j].type;
                                                    outputArray[j].fnTitle = locMap[j].fnTitle;
                                                    outputArray[j].careerStr = locMap[j].careerStr;
                                                    outputArray[j].interns_count = locMap[j].interns_count;
                                                    outputArray[j].fresher_ctc = locMap[j].fresher_ctc;
                                                    outputArray[j].fresher_count = locMap[j].fresher_count;
                                                    outputArray[j].lateral_count = locMap[j].lateral_count;
                                                    outputArray[j].locCode = locMap[j].locCode;
                                                }
                                                console.log(outputArray,"outputArray");
                                                responseMessage.status = true;
                                                responseMessage.message = 'LocMap saved successfully';
                                                responseMessage.data = {
                                                    loc :outputArray
                                                };
                                                res.status(200).json(responseMessage);
                                                console.log('FnSaveLocMap: LocMap saved successfully');
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
                                else{
                                    responseMessage.status = true;
                                    responseMessage.message = 'LocMap saved successfully';
                                    responseMessage.data = {loc :[]};
                                    res.status(200).json(responseMessage);
                                }
                            }
                            /**
                             * while executing proc if error comes then give error
                             * */
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('p_v1_addmembersbygroup: error in adding members :' + err);
                            }
                        });

                    }
                    else {
                        responseMessage.error = {
                            server: 'Invalid Token'
                        };
                        responseMessage.message = 'Error in validating Token';
                        res.status(401).json(responseMessage);
                        console.log('Error :', err);
                        var errorDate = new Date();
                        console.log(errorDate.toTimeString() + ' ......... error ...........');
                    }
                });
            }
            catch (ex) {
                responseMessage.error = {
                    server: 'Internal Server Error'
                };
                responseMessage.message = 'An error occurred !';
                res.status(500).json(responseMessage);
                console.log('Error p_v1_addmembersbygroup :  ', ex);
                var errorDate = new Date();
                console.log(errorDate.toTimeString() + ' ......... error ...........');
            }
        }
    }
    else{
        responseMessage.error = "Accepted content type is json only";
        res.status(400).json(responseMessage);
    }


});



module.exports = router;