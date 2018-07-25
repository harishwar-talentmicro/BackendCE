var express = require('express');
var router = express.Router();
var Ajv = require('ajv');
var cron = require('node-cron');
var DbHelper = require('../../helpers/DatabaseHandler'),
    db = DbHelper.getDBContext();

var CronJob = require('cron').CronJob;
var notifyMessages = require('../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();
var appConfig = require('../../ezeone-config.json');

var DBSecretKey = appConfig.DB.secretKey;

var request = require('request');
// var Client = require('node-rest-client').Client;   // for interview scheduler hirecraft
// var client = new Client();

var configurationV1 = require('./configuration.js');
var recruitmentV1 = require('./recruitment/recruitment-master.js');
var infoV1 = require('./info/info.js');
var expenseV1 = require('./expense.js');
var utilities = require('./utilities/utilities.js');
//var cvTempGenrate =  require('./cv_temp_genrate.js');
var itemGroupV1 = require('./item-group/item-group-master.js');
var associationV1 = require('./association/association-master.js');
var batchV1 = require('./batch/batch-master.js');
var messaageBoxV1 = require('./messagebox/messagebox-master.js');
var locForecastV1 = require('./line-of-career/loc-master.js');
var apVersionV1 = require('./ap-module/version.js');
var areaPartner = require('./area-partner/area-partner-master.js');
var configuration = require('./configuration/deal.js');
var jobRaiser = require('./job-raiser/job-raiser-routes');

var user = require('./user/user-routes');
var community = require('./community/community-routes');
var whatmatemanager = require('./whatmatemanager/whatmatemanager-routes');

var job = require('./job/job-routes');
var jobInfo = require('./jobInfo/jobInfo-routes');
var invite = require('./invite/invite-routes');
var helloEZE = require('./HEBackEnd/HEBackEnd-routes');
var HEformTemplate = require('./HEBackEnd/formTemplate.js');
var HETrackTemplate = require('./HEBackEnd/trackTemplate.js');
var HEholidayTemplate = require('./HEBackEnd/holidayTemplate.js');
var HEWorkLocation = require('./HEBackEnd/workLocation.js');
var HECurrency = require('./HEBackEnd/currency.js');
var HEMaster = require('./HEBackEnd/HEMasters.js');
var HEUser = require('./HEBackEnd/user.js');
var HEFormType = require('./HEApp/formType.js');
var HECompose = require('./HEApp/compose.js');
var HETask = require('./HEApp/task.js');
var HEAppMaster = require('./HEApp/master.js');
var HEMeeting = require('./HEApp/meeting.js');
var HEAttendance = require('./HEApp/attendance.js');
var HELeaveBalance = require('./HEApp/leaveBalance.js');
var HEDataViewLogin = require('./HEDataView/dataview.js');
var HELeaveLetter = require('./HEApp/leaveLetter.js');
var HEExpenseType = require('./HEBackEnd/expenseType.js');
var HEExpenseClaim = require('./HEApp/expenseClaim.js');
var HETravelRequest = require('./HEApp/travelRequest.js');
var HETravelClaim = require('./HEApp/travelClaim.js');
var HEItemRequest = require('./HEApp/itemRequest.js');
var HERequestMaster = require('./HEBackEnd/requestMaster.js');
var HELeave = require('./HEBackEnd/leave.js');
var HEITHelpDesk = require('./HEApp/ITHelpdeskRequest.js');
var HEVisitor = require('./HEApp/visitor.js');
var HELogInOut = require('./HEApp/TITO.js');
var HEsendMessage = require('./HEApp/sendMessage.js');
var HEsendSOSMessage = require('./HEApp/sendSOSMessage.js');
var HEgreeting = require('./HEApp/greeting.js');
var signup = require('./signup/signup-routes');
var HEHRDocs = require('./HEBackEnd/HRDocuments.js');
var HETransport = require('./HEApp/transport.js');
var HEQuery = require('./HEApp/query.js');
var HEsales = require('./HEBackEnd/sales.js');
var HEAppsales = require('./HEApp/sales.js');
var HEAppSupport = require('./HEApp/customerSupport.js');
var HEMeetingRoom = require('./HEBackEnd/meetingRoom.js');
var HEAppMeetingRoom = require('./HEApp/meetingRoom.js');
var HEAppRecruitment = require('./HEApp/recruitment.js');
var HEContentManager = require('./HEBackEnd/contentManager.js');
var HEInterview = require('./HEBackEnd/interview.js');
var HEPaySlip = require('./HEBackEnd/payslip.js');
var HEDataViewQueryLogin = require('./HEDataView/query.js');
var HEDataViewCustomerSupport = require('./HEDataView/customersupport.js');
var HEDataViewVisitor = require('./HEDataView/visitors.js');
var HEAppCompany = require('./HEApp/company.js');
var HEdepartment = require('./HEBackEnd/department.js');
var HEgrade = require('./HEBackEnd/grade.js');
var HERouteMap = require('./HEDataView/routeMap.js');
var vault = require('./vault/vault-routes');
var WMAdminManager = require('./WMAdminManager/WMAdminManager-routes');
var eventBackEnd = require('./HEBackEnd/event.js');
var eventApp = require('./HEApp/event.js');
var taxDeclarations = require('./tax/tax-routes');
var taxWebSavings = require('./HEBackEnd/taxSaving.js');
var policeStations = require('./HEApp/police.js');
var travelMode = require('./HEBackEnd/travelMode.js');
var generalRequest = require('./HEBackEnd/generalRequest.js');
var WMWindowsApp = require('./WMWindowsApp/WMWindowsApp-routes');
var zoom = require('./zoomMeeting/zoomMeeting-routes');
var appGeneralRequest = require('./HEApp/generalRequest.js');
var WGRM = require('./HEBackEnd/WGRMTemplates.js');
var eSurvey = require('./HEBackEnd/employeeSurvey.js');
// var likeShareComment=require('./HEApp/likeShareComment.js');

var hospitalTokenManagement = require('./HEApp/hospitalTokenManagement.js');

var generalOtp = require('./HEApp/otp/otp-routes.js');

var likeShareComment = require('./HEApp/likesharecomment.js');

//var testInfoV1 =  require('./info/test_info.js');
//var associationAPV1 =  require('./ap-module/association-ap/association-master-ap.js');

router.use('/configuration', configurationV1);
router.use('/recruitment', recruitmentV1);
router.use('/info', infoV1);
router.use('/expense', expenseV1);
router.use('/utilities', utilities);
//router.use('/cv_temp_genrate',cvTempGenrate);
router.use('/item', itemGroupV1);
router.use('/association', associationV1);
router.use('/batch', batchV1);
router.use('/mbox', messaageBoxV1);
router.use('/loc', locForecastV1);
router.use('/versionCode', apVersionV1);

router.use('/area_partner', areaPartner);
router.use('/job_raiser', jobRaiser);
router.use('/configuration', configuration);
router.use('/user', user);
router.use('/community', community);
router.use('/job', job);
router.use('/whatMate', whatmatemanager);

router.use('/invite', invite);
router.use('/jobInfo', jobInfo);

router.use('/signup', signup);
router.use('/otp', generalOtp);  // for general otp sending


// for Hello EZE Project
router.use('/helloEZE/appSettings', helloEZE);
router.use('/helloEZE', HEformTemplate);
router.use('/helloEZE', HETrackTemplate);
router.use('/helloEZE', HEholidayTemplate);
router.use('/helloEZE', HEWorkLocation);
router.use('/helloEZE', HECurrency);
router.use('/helloEZE', HEMaster);
router.use('/helloEZE', HEUser);
router.use('/helloEZE', HEHRDocs);
router.use('/helloEZE/app', HEFormType);
router.use('/helloEZE/app', HECompose);
router.use('/helloEZE/app', HETask);
router.use('/helloEZE/app', HEAppMaster);
router.use('/helloEZE/app', HEMeeting);
router.use('/helloEZE/app', HEAttendance);
router.use('/helloEZE/app', HELeaveBalance);
router.use('/helloEZE/dataview', HEDataViewLogin);
router.use('/helloEZE/dataview', HEDataViewQueryLogin);
router.use('/helloEZE/dataview', HEDataViewCustomerSupport);
router.use('/helloEZE/dataview', HERouteMap);
router.use('/helloEZE/app', HELeaveLetter);
router.use('/helloEZE/app', HEExpenseClaim);
router.use('/helloEZE/app', HETravelRequest);
router.use('/helloEZE', HEExpenseType);
router.use('/helloEZE', HERequestMaster);
router.use('/helloEZE/app', HETravelClaim);
router.use('/helloEZE/app', HEItemRequest);
router.use('/helloEZE', HELeave);
router.use('/helloEZE/app', HEITHelpDesk);
router.use('/helloEZE/app', HEVisitor);
router.use('/helloEZE/app', HELogInOut);
router.use('/helloEZE/app', HEsendMessage);
router.use('/helloEZE/app', HEsendSOSMessage);
router.use('/helloEZE/app', HEgreeting);
router.use('/helloEZE/app', HETransport);
router.use('/helloEZE/app', HEQuery);
router.use('/helloEZE', HEsales);
router.use('/helloEZE/app', HEAppsales);
router.use('/helloEZE/app', HEAppSupport);
router.use('/helloEZE', HEMeetingRoom);
router.use('/helloEZE/app', HEAppMeetingRoom);
router.use('/helloEZE/app', HEAppRecruitment);
router.use('/helloEZE', HEContentManager);
router.use('/helloEZE', HEInterview);
router.use('/helloEZE', HEPaySlip);
router.use('/helloEZE/app', HEAppCompany);
router.use('/helloEZE/dataview', HEDataViewVisitor);
router.use('/helloEZE', HEdepartment);
router.use('/helloEZE', HEgrade);
router.use('/vault', vault);
router.use('/WhatMate/admin', WMAdminManager);
router.use('/helloEZE', eventBackEnd);
router.use('/helloEZE/app', eventApp);
router.use('/helloEZE/app', taxDeclarations);
router.use('/helloEZE', taxWebSavings);
router.use('/helloEZE/app', policeStations);
router.use('/helloEZE', travelMode);
router.use('/helloEZE', generalRequest);
router.use('/helloEZE/app', appGeneralRequest);
router.use('/helloEZE/app', zoom);
router.use('/helloEZE/', WGRM);
router.use('/WhatMate/Windows', WMWindowsApp);



router.use('/helloEZE/app', hospitalTokenManagement);
router.use('/helloEZE', eSurvey);

router.use('/helloEZE/app', likeShareComment);


//router.use('/test_info',testInfoV1);
//router.use('/association-ap',associationAPV1);

router.get('/test', function (req, res, next) {
    /**
     * Keep coerceTypes true for inputData to cast one datatype into another
     * for eg. '1'[string] to 1[integer]
     */
    var inAjv = new Ajv({ coerceTypes: true });
    var validInputSchema = {
        "properties": {
            "ezeoneId": {
                "type": "string",
                "maxLength": 15
            },
            "idType": {
                "type": "number",
                "minimum": 1,
                "maximum": 4
            }
        },
        "required": ["ezeoneId", "idType"]
    };
    //////////////////////////////////////////////////

    var inSchema = schemaLoader.load('/api/v1.1/test', 'GET', 'input', 0);
    var outSchema1 = schemaLoader.load('/api/v1.1/test', 'GET', 'output', 0);
    var outSchema2 = schemaLoader.load('/api/v1.1/test', 'GET', 'output', 1);


    ajv.validate(inSchema, req.body);



    /////////////////////////////////////////////////


    if (!inAjv.validate(validInputSchema, req.query)) {
        console.log('In Schema validation failed');
        res.json({
            status: false,
            error: inAjv.errors,
            message: 'Please check errors',
            data: null
        });
        return;
    }

    var validOutputSchema = {
        "properties": {
            "id": {
                "type": "integer",
                "min": 1
            },
            "companyName": {
                "type": "string",
                "maxLength": 100
            }
        },
        "required": ["id", "companyName"]
    };

    var query = 'select TID AS id, CompanyName AS companyName from tmaster WHERE EZEID = ' + req.db.escape("@SGOWRI2");
    req.db.query(query, function (err, results) {
        if (!err) {
            console.log(results);
            if (results && results[0]) {
                /**
                 * Compares only first object as we assume that one query will produce same kind of objects if
                 * multiple results are there
                 *
                 */

                var outAjv = new Ajv();
                if (!outAjv.validate(validOutputSchema, results[0])) {
                    console.log('Out Schema validation failed');
                    res.status(500).json({
                        status: false,
                        message: "Invalid schema",
                        data: null,
                        error: outAjv.errors
                    });
                    return;
                }

                res.json({
                    status: true,
                    message: "Test working",
                    result: results,
                    error: null
                });
            }
            else {
                res.json({
                    status: true,
                    message: "Test working",
                    result: [],
                    error: null
                });
            }
        }
    });

});

// JobRaiser Project starts from here
var jobModule = require('./JobRaiser/job.js');
var masterModule = require('./JobRaiser/master.js');
var applicantModule = require('./JobRaiser/cv.js');  // on feb 5th
var jobPortalModule = require('./JobRaiser/jobPortal.js');  // on feb 5th
var paceUsersModule = require('./JobRaiser/paceusers.js');
var walkInCvModule = require('./JobRaiser/walkInCV.js');
var gulfModule = require('./JobRaiser/gulf.js');
var settings = require('./JobRaiser/settings.js');
var billing = require('./JobRaiser/billing.js');


router.use('/WM', jobModule);
router.use('/WM', masterModule);
router.use('/WM', applicantModule);
router.use('/WM', jobPortalModule);
router.use('/WM', paceUsersModule);
router.use('/WM', walkInCvModule);
router.use('/WM', gulfModule);
router.use('/WM', settings);
router.use('/WM', billing);

// cron
// var taskScheduler = require('../api/HEApp/task/task-ctrl');
cron.schedule('*/15 * * * *', function () {
    console.log('running a task every minute');
    var datetime = new Date();
    console.log(datetime);
    var procQuery = 'CALL he_schedule_tasks()';
    console.log(procQuery);

    db.query(procQuery, function (err, results) {
        console.log(results);
        if (!err) {
            console.log(err);
        }
        else {
            console.log("success");
        }
    });

});

cron.schedule('*/15 * * * *', function () {
    // console.log('running a leave calculation every minute');
    var procQuery = 'CALL he_leave_calculator()';
    console.log(procQuery);
    db.query(procQuery, function (err, results) {
        // console.log(results);
        if (!err) {
            console.log(err);
        }
        else {
            console.log("success");
        }
    });
});
// var cronJobMessage = new CronJob({
//     cronTime: '20 * * * * *',
//     onTick: function () {
//         notifyMessages.getMessagesNeedToNotify();
//
//         /*
//          * Runs every weekday (Monday through Friday)
//          * at 11:30:00 AM. It does not run on Saturday
//          * or Sunday.
//          */
//     },
//     start: false,
//     timeZone: 'America/Los_Angeles'
// });
// cronJobMessage.start();

cron.schedule('*/10 * * * *', function () {
    console.log('running a notify messages');
    notifyMessages.getMessagesNeedToNotify();
});


//Example POST method invocation



// cron.schedule('*/15 * * * *', function () {
var cluster = require('cluster');

if (cluster.isWorker) {
    console.log('asdf', cluster.worker.id);

    if (cluster.worker.id == 1) {

        var cronJobInterview = new CronJob({
            cronTime: '*/30 * * * *',
            onTick: function () {
                var query = "call wm_integrationUrlForHircraft()";
                db.query(query, function (err, result) {
                    if (err) {
                        console.log('error: integrationUrlForHircraft');
                    }
                    else if ((result[0].length != 0) && (result[1].length != 0)) {
                        var heMasterId;
                        var transId;
                        var integrationFormData = {};
                        var DBUrl;
                        // console.log(result);
                        if (result && result[0] && result[0][0] && result[1] && result[1][0]) {
                            heMasterId = result[0][0].heMasterId;
                            DBUrl = result[0][0].url;
                            transId = result[1][0].transId;
                            var response_server = (result[1][0].integrationFormdata);
                            // console.log(response_server);
                            if (typeof (response_server) == "string") {
                                response_server = JSON.parse(response_server);
                            }

                            if (typeof (response_server.assessment) == 'string') {
                                response_server.assessment = JSON.parse(response_server.assessment);
                            }

                            if (typeof (response_server.assessment.integrationAssessmentDetails) == 'string') {
                                response_server.assessment.integrationAssessmentDetails = JSON.parse(response_server.assessment.integrationAssessmentDetails);
                            }

                            for (var r = 0; r < response_server.assessment.integrationAssessmentDetails.length; r++) {

                                if (typeof (response_server.assessment.integrationAssessmentDetails[r].integrationQuestions) == 'string') {
                                    response_server.assessment.integrationAssessmentDetails[r].integrationQuestions = JSON.parse(response_server.assessment.integrationAssessmentDetails[r].integrationQuestions);
                                }
                                for (var s = 0; s < response_server.assessment.integrationAssessmentDetails[r].integrationQuestions.length; s++) {
                                    if (typeof (response_server.assessment.integrationAssessmentDetails[r].integrationQuestions[s].integrationselectedOption) == 'string') {
                                        response_server.assessment.integrationAssessmentDetails[r].integrationQuestions[s].integrationselectedOption = JSON.parse(response_server.assessment.integrationAssessmentDetails[r].integrationQuestions[s].integrationselectedOption);
                                    }
                                }
                            }
                            console.log("response_server", response_server);
                            var count = 0;
                            request({
                                url: DBUrl,
                                method: "POST",
                                json: true,   // <--Very important!!!
                                body: response_server
                            }, function (error, response, body) {
                                console.log(error);
                                console.log(body);
                                console.log("response_server", response_server);
                                if (body && body.Code && body.Code == "SUCCESS0001") {
                                    var updateQuery = "update 1014_trans set sync=1 where heParentId=" + transId;
                                    db.query(updateQuery, function (err, results) {
                                        if (err) {
                                            console.log("update sync query throws error");
                                        }
                                        else {
                                            console.log("sync is updated to 1 successfully", transId);
                                        }
                                    });
                                }
                                count++;
                            });
                            console.log('tallint interview hit for ', count, ' times');
                        }
                    }
                });
                console.log('Interview cron job running');
            },
            start: false,
            timeZone: 'America/Los_Angeles'
        });
        cronJobInterview.start();
    }
}
// });



if (cluster.isWorker) {
    console.log('walkIn cluster', cluster.worker.id);

    if (cluster.worker.id == 1) {
        // run job

        console.log("bye take care")
        var cronJobWalkIn = new CronJob({
            cronTime: '*/15 * * * * *',
            onTick: function () {
                var query = "call wm_integrationUrlwalkIn()";
                db.query(query, function (err, result) {
                    console.log('Running walkin cron job for Hexaware');
                    if (err) {
                        console.log('error: integrationUrlForHircraft');
                    }
                    else if ((result[0].length != 0) && (result[1].length != 0)) {
                        var heMasterId;
                        var transId;
                        var formData = {};
                        var DBUrl;
                        if (result && result[0] && result[0][0] && result[1] && result[1][0]) {
                            heMasterId = result[0][0].heMasterId;
                            DBUrl = result[0][0].url;
                            transId = result[1][0].transId;
                            formData = result[1][0].formData;

                            // NEED TO PARSE FORMDATA AND SEND TO BODY OF REQUEST
                            var count = 0;
                            request({
                                url: DBUrl,
                                method: "POST",
                                json: true,   // <--Very important!!!
                                body: JSON.parse(formData)
                            }, function (error, response, body) {
                                console.log(error);
                                console.log(body);  // ERR_07: Duplicate Email. ERR_08: Duplicate Mobile (If duplicate then also update our database)
                                if (body && body.Code && ((body.Code == "SAVED") || body.Rid || (body.Code == "INFO_01") || (body.Code == "INFO_02") || (body.Code == "INFO_03") || (body.Code == "ERR_07") || (body.Code == "ERR_08"))) {
                                    var updateQuery = "update 1039_trans set sync=1, Rid=" + body.Rid + " where heParentId=" + transId;
                                    console.log("walkIn", updateQuery);
                                    db.query(updateQuery, function (err, results) {
                                        if (err) {
                                            console.log("update sync query throws error");
                                        }
                                        else {
                                            console.log("sync is updated to 1 successfully of transId", transId);
                                        }
                                    });
                                }
                                count++;
                            });
                            console.log('tallint walkIn hit for ', count, ' times');
                        }
                    }
                });
            },
            start: false,
            timeZone: 'America/Los_Angeles'
        });
        cronJobWalkIn.start();
    }
}

// });

// var cluster = require('cluster');

if (cluster.isWorker) {
    console.log('quess walkIn cluster', cluster.worker.id);

    if (cluster.worker.id == 1) {


        var cronJobWalkInQuessCorp = new CronJob({
            cronTime: '*/5 * * * * *',
            onTick: function () {
                var query = "call wm_integrationUrlwalkInForQuessCorp()";
                db.query(query, function (err, result) {
                    console.log('Running walkin cron job For Quess Corp ', query);
                    if (err) {
                        console.log('error: integrationUrl For Quess Corp');
                    }
                    else if ((result[0].length != 0) && (result[1].length != 0)) {
                        var heMasterId;
                        var transId;
                        var formData = {};
                        var DBUrl;
                        if (result && result[0] && result[0][0] && result[1] && result[1][0]) {
                            heMasterId = result[0][0].heMasterId;
                            DBUrl = result[0][0].url;
                            transId = result[1][0].transId;
                            formData = result[1][0].formData;

                            // NEED TO PARSE FORMDATA AND SEND TO BODY OF REQUEST
                            var count = 0;
                            request({
                                url: DBUrl,
                                method: "POST",
                                json: true,   // <--Very important!!!
                                body: JSON.parse(formData)
                            }, function (error, response, body) {
                                console.log(error);
                                console.log(body);  // ERR_07: Duplicate Email. ERR_08: Duplicate Mobile (If duplicate then also update our database)
                                if (body && body.Code && ((body.Code == "SAVED") || body.Rid || (body.Code == "INFO_01") || (body.Code == "INFO_02") || (body.Code == "INFO_03") || (body.Code == "ERR_07") || (body.Code == "ERR_08"))) {
                                    var updateQuery = "update 1039_trans set sync=1, Rid=" + body.Rid + " where heParentId=" + transId;
                                    db.query(updateQuery, function (err, results) {
                                        if (err) {
                                            console.log("update sync query throws error");
                                        }
                                        else {
                                            console.log("sync is updated to 1 successfully of transId", transId);
                                        }
                                    });
                                }
                                count++;
                            });
                            console.log('Quess Corp walkIn hit for ', count, ' times');
                        }
                    }
                });
            },
            start: false,
            timeZone: 'America/Los_Angeles'
        });
        cronJobWalkInQuessCorp.start();
    }
}




if (cluster.isWorker) {

    if (cluster.worker.id == 1) {
        var cronJobgreeting = new CronJob({
            cronTime: '00 08 * * * *',
            onTick: function () {

                // console.log('running a notify messages');
                // notifyMessages.getMessagesNeedToNotify();
                cronjob = function (req, res, next) {
                    console.log("greeting cron");

                    var response = {
                        status: false,
                        message: "Invalid token",
                        data: null,
                        error: null
                    };

                    var procQuery = 'CALL wm_get_todayDOBList("' + DBSecretKey + '")';
                    console.log(procQuery);
                    db.query(procQuery, function (err, results) {

                        if (!err && results && results[0]) {
                            senderGroupId = results[0][0].senderId;
                            notifyMessages.getMessagesNeedToNotify();
                            console.log("Greetings sent successfully")
                        }

                        else {
                            console.log("error",err);
                        }
                    });
                }
                cronjob();
            },
            start: false,
            timeZone: 'America/Los_Angeles'

        });
        cronJobgreeting.start();
    }
}


//  query re notifier
if (cluster.isWorker) {

    if (cluster.worker.id == 1) {
        var cronJobgreeting = new CronJob({
            cronTime: '00 08 * * * *',
            onTick: function () {

                console.log('running a help desk re notifier');
                var query = "call wm_get_remainderForQuery()";
                db.query(query, function (err, result) {
                    if (err) {
                        console.log('error:wm_get_remainderForQuery', err);
                    }
                    else {
                        notifyMessages.getMessagesNeedToNotify();
                    }
                });
            },
            start: false,
            timeZone: 'America/Los_Angeles'

        });
        cronJobgreeting.start();
    }
}

module.exports = router;