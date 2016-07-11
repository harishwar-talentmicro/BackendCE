/**
 *  @author Anjali Pandya
 *  @since July 22,2015  03:42PM
 *  @title Job module
 *  @description Handles Job functions
 */
"use strict";
var path = require('path');
var chalk = require('chalk');
var util = require('util');
var NotificationTemplater = require('../lib/NotificationTemplater.js');

var notificationTemplater = new NotificationTemplater();




var Notification = require('./notification/notification-master.js');
var NotificationQueryManager = require('./notification/notification-query.js');
var Mailer = require('../../mail/mailer.js');
var mailerApi = new Mailer();
var notification = null;
var notificationQmManager = null;
var fs = require('fs');
var moment = require('moment');

var st = null;
function Job(db,stdLib){

    if(stdLib){
        st = stdLib;
        notification = new Notification(db,stdLib);
        notificationQmManager = new NotificationQueryManager(db,stdLib);
    }
};


/**
 * @todo FnSaveJobs
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save jobs of a person
 */
Job.prototype.create = function(req,res,next){
    var fs = require("fs");
    var token = req.body.token;
    var tid = req.body.tid;
    var ezeoneId = req.st.alterEzeoneId(req.body.ezeone_id);
    var jobCode = req.body.job_code;
    var jobTitle = req.body.job_title;
    var expFrom = req.body.exp_from ? req.body.exp_from : 0;
    var expTo = req.body.exp_to ? req.body.exp_to : 0;
    var jobDescription = req.body.job_description;
    var salaryFrom = req.body.salaryFrom;
    var salaryTo = req.body.salaryTo;
    var salaryType = req.body.salaryType;
    var keySkills = req.body.keySkills ? req.body.keySkills : '';
    var openings = req.body.openings;
    var jobType = (req.body.jobType) ? parseInt(req.body.jobType) : 0;
    if(isNaN(jobType)){
        jobType = 0;
    }
    var status = req.body.status;
    var contactName = req.body.contactName;
    var email =req.body.email_id ? req.body.email_id : '';
    var mobileNo =req.body.mobileNo ? req.body.mobileNo : '';
    var locationsList = req.body.locationsList;
    var instituteIdStr = (req.body.institute_id) ? req.body.institute_id : '';
    if(typeof(locationsList) == "string") {
        locationsList = JSON.parse(locationsList);
    }
    var location_id = '', resultvalue = '';
    var skillMatrix1 = req.body.skillMatrix;
    skillMatrix1= JSON.parse(JSON.stringify(skillMatrix1));
    if (!skillMatrix1){
        skillMatrix1=[];
    }
    var cid = req.body.cid ? parseInt(req.body.cid) : 0;   // client id
    var conatctId = req.body.ctid ? parseInt(req.body.ctid) : 0;     // contact id
    var isconfidential = req.body.isconfi ? parseInt(req.body.isconfi) : 0;
    var alumniCode = req.body.acode ? req.body.acode : '';    // alumni code
    var locMatrix = req.body.locMatrix;
    locMatrix= JSON.parse(JSON.stringify(locMatrix));
    var educations = req.body.jobEducation;
    educations= JSON.parse(JSON.stringify(educations));
    var iphoneID='';
    var jobID;
    var m = 0;
    var receiverId;
    var senderTitle;
    var groupTitle;
    var groupId;
    var messageText;
    var messageType;
    var operationType;
    var iphoneId;
    var userId = [];
    var emailArray = [];
    var instituteArray = [];
    var jobTypeList =  [
        "Full Time",
        "Part Time",
        "Work from Home",
        "Internship",
        "Apprenticeship",
        "Job Oriented Training",
        "Freelancer"
    ];
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var error = {};
    var validateStatus = true;

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!tid){
        tid = 0;
    }
    if(isNaN(parseInt(tid))){
        error['tid'] = 'Invalid tid';
        validateStatus *= false;
    }
    if(!ezeoneId){
        error['ezeoneId'] = 'Invalid ezeoneId';
        validateStatus *= false;
    }
    if(!jobCode){
        error['jobCode'] = 'Invalid jobCode';
        validateStatus *= false;
    }
    if(!jobTitle){
        error['jobTitle'] = 'Invalid jobTitle';
        validateStatus *= false;
    }
    if(!jobDescription){
        error['jobDescription'] = 'Invalid jobDescription';
        validateStatus *= false;
    }
    if(!salaryFrom && !salaryTo){
        error['salary'] = 'Invalid SalaryFrom or SalaryTo';
        validateStatus *= false;
    }
    if(!salaryType){
        error['salaryType'] = 'Invalid salaryType';
        validateStatus *= false;
    }
    if(!openings){
        error['openings'] = 'Invalid openings';
        validateStatus *= false;
    }
    if(isNaN(parseInt(jobType))){
        error['jobType'] = 'Invalid jobType';
        validateStatus *= false;
    }
    if(isNaN(parseInt(status))){
        error['status'] = 'Invalid status';
        validateStatus *= false;
    }
    if(!locationsList){
        locationsList = [];
    }
    if(isNaN(parseInt(cid))){
        error['cid'] = 'Invalid client id';
        validateStatus *= false;
    }
    if(isNaN(parseInt(conatctId))){
        error['conatctId'] = 'Invalid conatctId';
        validateStatus *= false;
    }
    if(!validateStatus){
        responseMessage.status = false;
        responseMessage.message = 'Please check the errors below';
        responseMessage.error = error;
        responseMessage.data = null;
        res.status(400).json(responseMessage);
    }
    else{
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var locCount = 0;
                        var locationDetails = locationsList[locCount];
                        location_id = location_id.substr(0,location_id.length - 1);
                        var createJobPosting = function(){
                            var query = st.db.escape(tid) + ',' + st.db.escape(ezeoneId) + ',' + st.db.escape(jobCode)
                                + ',' + st.db.escape(jobTitle) + ',' + st.db.escape(expFrom) + ',' + st.db.escape(expTo)
                                + ',' + st.db.escape(jobDescription) + ',' + st.db.escape(salaryFrom) + ',' + st.db.escape(salaryTo)
                                + ',' + st.db.escape(salaryType) + ',' + st.db.escape(keySkills) + ',' + st.db.escape(openings)
                                + ',' + st.db.escape(jobType) + ',' + st.db.escape(status) + ',' + st.db.escape(contactName)
                                + ',' + st.db.escape(email) + ',' + st.db.escape(mobileNo) + ',' + st.db.escape(location_id)
                                + ','  +st.db.escape(instituteIdStr)+ ',' + st.db.escape(cid)+ ',' + st.db.escape(conatctId)
                                + ',' + st.db.escape(isconfidential) + ',' + st.db.escape(alumniCode);
                            console.log('CALL pSaveJobs(' + query + ')');
                            st.db.query('CALL pSaveJobs(' + query + ')', function (err, insertResult) {
                                if (!err) {
                                    if (insertResult && insertResult[0] && insertResult[0][0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Jobs save successfully';
                                        responseMessage.data = {
                                            tid: tid,
                                            ezeoneId: ezeoneId,
                                            job_code: jobCode,
                                            job_title: jobTitle,
                                            exp_from: expFrom,
                                            exp_to: expTo,
                                            job_description: jobDescription,
                                            salaryFrom: salaryFrom,
                                            salaryTo: salaryTo,
                                            salaryType: salaryType,
                                            keySkills: keySkills,
                                            openings: openings,
                                            jobType: jobType,
                                            status: status,
                                            contactName: contactName, //Whom to contact for this job, don't confuse it with client and contact
                                            email_id: email,
                                            mobileNo: mobileNo,
                                            location_id: location_id,
                                            cid : cid,
                                            ctid : conatctId,
                                            isconfi : isconfidential,
                                            acode : alumniCode,
                                            institute_id : req.body.institute_id
                                        };


                                        var bigCombinedQuery = "";
                                        /**
                                         * Preparing LOC Matrix insertion query and adding it to bigCombinedQuery
                                         */
                                        if(locMatrix) {
                                            var locInsertQuery = "";
                                            for(var i=0; i < locMatrix.length; i++) {
                                                //async.each(locMatrix, function iterator(locDetails, callback) {
                                                var locSkills = {
                                                    expertiseLevel: locMatrix[i].expertiseLevel,
                                                    jobId: insertResult[0][0].jobid,
                                                    expFrom: locMatrix[i].exp_from,
                                                    expTo: locMatrix[i].exp_to,
                                                    fid: locMatrix[i].fid,
                                                    careerId: locMatrix[i].career_id,
                                                    scoreFrom: locMatrix[i].score_from,
                                                    scoreTo: locMatrix[i].score_to
                                                };

                                                var queryParams = st.db.escape(locSkills.jobId)
                                                    + ',' + st.db.escape(locSkills.expFrom) + ',' + st.db.escape(locSkills.expTo)
                                                    + ',' + st.db.escape(locSkills.expertiseLevel) + ',' + st.db.escape(locSkills.careerId)
                                                    + ',' + st.db.escape(locSkills.scoreFrom) + ',' + st.db.escape(locSkills.scoreTo);

                                                locInsertQuery += 'CALL pSaveJobLOC(' + queryParams + ');';
                                            }
                                            console.log(locInsertQuery);
                                            bigCombinedQuery += locInsertQuery;
                                        }
                                        /**
                                         * Prepare education insertion query and adding it to bigCombinedQuery
                                         */
                                        if(educations) {
                                            var educationInsertQuery = "";
                                            for(var j=0; j < educations.length; j++) {

                                                var educationData = {
                                                    jobId: insertResult[0][0].jobid,
                                                    eduId: educations[j].edu_id,
                                                    /**
                                                     * Error from front end side handled on server end
                                                     */
                                                    spcId: (educations[j].spc_id) ? educations[j].spc_id.toString() : "",
                                                    scoreFrom: educations[j].score_from,
                                                    scoreTo: educations[j].score_to,
                                                    level: educations[j].expertiseLevel
                                                };
                                                console.log(educationData);
                                                var queryParams = st.db.escape(educationData.jobId) + ',' + st.db.escape(educationData.eduId)
                                                    + ',' + st.db.escape(educationData.spcId) + ',' + st.db.escape(educationData.scoreFrom)
                                                    + ',' + st.db.escape(educationData.scoreTo) + ',' + st.db.escape(educationData.level);

                                                educationInsertQuery += 'CALL psavejobeducation(' + queryParams + ');';
                                            }
                                            console.log(educationInsertQuery);
                                            bigCombinedQuery += educationInsertQuery;
                                        }


                                        if(bigCombinedQuery){
                                            st.db.query(bigCombinedQuery, function (err, notificationResult) {
                                                if (!err) {
                                                    res.status(200).json(responseMessage);
                                                    /**
                                                     * As notifications can be sent afterwards also by providing response as response
                                                     * doesn't get altered throught this process
                                                     */
                                                    postNotification(insertResult[0][0].jobid);
                                                }
                                                else{
                                                    responseMessage.message = 'An error occured ! Please try again';
                                                    res.status(500).json(responseMessage);
                                                    console.log('FnSaveJobs: error in saving jobs details:' + err);
                                                }
                                            });
                                        }
                                        else{
                                            res.status(200).json(responseMessage);
                                            postNotification(insertResult[0][0].jobid);
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'No save Jobs details';
                                        res.status(400).json(responseMessage);
                                        console.log('FnSaveJobs:No save Jobs details');
                                    }
                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    res.status(500).json(responseMessage);
                                    console.log('FnSaveJobs: error in saving jobs details:' + err);
                                }
                            });
                        };
                        var postNotification = function(jobID){
                            var queryParams = st.db.escape(jobID) + ',' + st.db.escape(token);
                            /**
                             * send notification to eligible students
                             * @type {string}
                             */

                            /**
                             *
                             */
                            var query = 'CALL PNotifyForCVsAfterJobPostedNew(' + queryParams + ')';
                            console.log(query);
                            st.db.query(query, function (err, notificationResult) {
                                if (!err) {
                                    console.log(notificationResult);
                                    if (notificationResult && notificationResult[0]) {
                                            /**
                                             * @TODO Now array of objects will come in notificationResult[0] having
                                             * masterId
                                             * groupId
                                             * iphoneId
                                             * email
                                             * ezeoneId
                                             * firstName
                                             *
                                             * @TODO Now array of objects will come in notificationResult[2] having
                                             * masterId
                                             * instiuteName
                                             * isVerified
                                             *
                                             * @TODO send mail and notification to the students by getting information from notificationResult[0] array
                                             * @TODO send mail and notification to verified college placement officers (and subusers) by seeing notificationResult[2]
                                             * @TODO send mail to unverified college placement officers by seeing notificationResult[2]
                                             *
                                             */

                                            var combinedSuggestedJobQuery = "";

                                            for(var counter = 0; counter < notificationResult[0].length; counter++){
                                                /**
                                                 * Checking that job is posted to the institute or public portal
                                                 * so based on that mail and notification template can be loaded conditionally
                                                 */

                                                var notificationTpl = 'individual_candidate_job_suggestion';
                                                var mailTpl = 'individual_candidate_job_suggestion';

                                                if(notificationResult[2].length){
                                                    /**
                                                     * Loading notification and mail template which is sent to students of an institute
                                                     */

                                                    notificationTpl = 'institute_candidate_job_suggestion';
                                                    mailTpl = 'institute_candidate_job_suggestion';
                                                }

                                                var notificationTemplaterRes = notificationTemplater.parse(notificationTpl,{
                                                    jobType : jobTypeList[jobType],
                                                    jobTitle : jobTitle,
                                                    jobCode : jobCode,
                                                    companyName : notificationResult[1][0].cn // Who posted the job
                                                });

                                                if(notificationTemplaterRes.parsedTpl){
                                                    notification.publish(
                                                        notificationResult[0][counter].groupId,
                                                        ezeoneId,
                                                        ezeoneId,
                                                        notificationResult[0][counter].groupId,
                                                        notificationTemplaterRes.parsedTpl,
                                                        8,
                                                        0, notificationResult[0][counter].iphoneId,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        1,
                                                        moment().format("YYYY-MM-DD HH:mm:ss"),
                                                        '',
                                                        0,
                                                        jobID);
                                                    console.log('postNotification : Job suggestion notification sent successfully');
                                                }
                                                else{
                                                    console.log('Error in parsing notification '+notificationTpl+' template - ',
                                                        notificationTemplaterRes.error);
                                                    console.log('postNotification : Job suggestion notification not sent');
                                                }

                                                console.log('mailTpl',mailTpl);

                                                mailerApi.sendMailNew(mailTpl,{
                                                    firstName : notificationResult[0][counter].firstName,
                                                    jobType : jobTypeList[jobType],
                                                    jobTitle : jobTitle,
                                                    jobCode : jobCode,
                                                    companyName : notificationResult[1][0].cn,
                                                    keySkills : (keySkills) ? keySkills : '',
                                                    jobId : jobID
                                                },'New job alert',notificationResult[0][counter].email);




                                                /**
                                                 * To save suggested jobs for candidates to whom the posted job is matching
                                                 * @param masterId of candidate [int]
                                                 * @param jobId [int]
                                                 */
                                                var suggestedJobQueryParam = st.db.escape(notificationResult[0][0].masterId) + ',' + st.db.escape(jobID);
                                                var suggestedJobQuery = 'CALL psavejobnotification(' + suggestedJobQueryParam + ');';
                                                console.log(suggestedJobQuery);
                                                combinedSuggestedJobQuery += suggestedJobQuery;

                                            }

                                            /**
                                             * Preparing a query to get mail and notification details of placement officers and
                                             * subusers of their colleges
                                             */

                                            var combinePOquery = "";
                                            for(counter = 0; counter < notificationResult[2].length; counter++){
                                                var queryPOparamsList = [st.db.escape(notificationResult[2][counter].ezeoneId),  st.db.escape(4)];
                                                combinePOquery += 'CALL get_subuser_list(' + queryPOparamsList.join(',') + ');';
                                            }

                                            console.log('combinePOquery',combinePOquery);

                                            if(combinePOquery){
                                                /**
                                                 * Finding all the institute placement officers and their subusers to
                                                 * get their mail IDs
                                                 */
                                                st.db.query(combinePOquery, function (err, notDetailsRes) {
                                                    if((!err) && notDetailsRes && notDetailsRes.length){

                                                        console.log('notDetailsRes',notDetailsRes);

                                                        for(counter = 0; counter < notDetailsRes.length; counter++){
                                                            if(counter%2 == 0){

                                                                for(var counter1 = 0; counter1 < notDetailsRes[counter].length; counter1++){

                                                                    var mailTpl = 'placement_officer_unverified_job_alert';
                                                                    var pOnotificationTpl = 'placement_officer_unverified_job_alert';

                                                                    /**
                                                                     * Finding if the placement officer is the masterId or he is a subuser
                                                                     * If he is a master then we will send him mail even if he has not
                                                                     * enabled the recruitment module in his user section of settings(configuration)
                                                                     */
                                                                    var isMaster = notDetailsRes[counter][counter1].groupTitle ?
                                                                        (notDetailsRes[counter][counter1].groupTitle.split('.').length <= 1) : false;


                                                                    if(notDetailsRes[counter][counter1].isVerified){

                                                                        console.log('\n Verified ID ',notDetailsRes[counter][counter1].groupId);
                                                                        /**
                                                                         * These colleges are verified so send them a notification and mail to this placement officer
                                                                         * to change the status of this job
                                                                         *
                                                                         */
                                                                        mailTpl = 'placement_officer_job_approval';
                                                                        pOnotificationTpl = 'placement_officer_job_approval';


                                                                    }

                                                                    chalk.green('notDetailsRes[counter][counter1].groupId',notDetailsRes[counter][counter1].groupId);

                                                                    if(isMaster){
                                                                        if(notDetailsRes[counter][counter1].CVMailID){
                                                                            mailerApi.sendMailNew(mailTpl,{
                                                                                jobType : jobTypeList[jobType],
                                                                                jobTitle : jobTitle,
                                                                                jobCode : jobCode,
                                                                                companyName : notificationResult[1][0].cn,
                                                                                keySkills : (keySkills) ? keySkills : '',
                                                                                jobId : jobID
                                                                            },"New job posted for your institute",notDetailsRes[counter][counter1].CVMailID);
                                                                        }

                                                                        if(notDetailsRes[counter][counter1].AdminEmailID){
                                                                            mailerApi.sendMailNew(mailTpl,{
                                                                                jobType : jobTypeList[jobType],
                                                                                jobTitle : jobTitle,
                                                                                jobCode : jobCode,
                                                                                companyName : notificationResult[1][0].cn,
                                                                                keySkills : (keySkills) ? keySkills : '',
                                                                                jobId : jobID
                                                                            },"New job posted for your institute",notDetailsRes[counter][counter1].AdminEmailID);
                                                                        }

                                                                        notificationTemplaterRes = notificationTemplater.parse(pOnotificationTpl,{
                                                                            jobType : jobTypeList[jobType],
                                                                            jobTitle : jobTitle,
                                                                            jobCode : jobCode,
                                                                            companyName : notificationResult[1][0].cn // Who posted the job
                                                                        });


                                                                        if(notificationTemplaterRes.parsedTpl){
                                                                            notification.publish(
                                                                                notDetailsRes[counter][counter1].groupId,
                                                                                ezeoneId,
                                                                                ezeoneId,
                                                                                notDetailsRes[counter][counter1].groupId,
                                                                                notificationTemplaterRes.parsedTpl,
                                                                                8,
                                                                                0, notDetailsRes[counter][counter1].iphoneId,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                1,
                                                                                moment().format("YYYY-MM-DD HH:mm:ss"),
                                                                                '',
                                                                                0,
                                                                                jobID);
                                                                            console.log('postNotification : Job notification for Placement Officer is sent successfully');
                                                                        }
                                                                        else{
                                                                            console.log('Error in parsing notification '+notificationTpl+' template - ',
                                                                                notificationTemplaterRes.error);
                                                                            console.log('postNotification : Job notification for Placement Officer is not sent');
                                                                        }

                                                                    }



                                                                    /**
                                                                     * If the placement officer is a subuser and is not master then we will check
                                                                     * his user module rights to see whether he is having right to access user module or not
                                                                     * If yes then only we will send him the mail and notification
                                                                     */
                                                                    else if(notDetailsRes[counter][counter1].userRights &&
                                                                        notDetailsRes[counter][counter1].userRights.length == 5 &&
                                                                        parseInt(notDetailsRes[counter][counter1].userRights[4]) > 0){



                                                                        console.log('Coming to else if block00');

                                                                        if(notDetailsRes[counter][counter1].CVMailID){
                                                                            mailerApi.sendMailNew(mailTpl,{
                                                                                jobType : jobTypeList[jobType],
                                                                                jobTitle : jobTitle,
                                                                                jobCode : jobCode,
                                                                                companyName : notificationResult[1][0].cn,
                                                                                keySkills : (keySkills) ? keySkills : '',
                                                                                jobId : jobID
                                                                            },"New job posted for your institute",notDetailsRes[counter][counter1].CVMailID);
                                                                        }

                                                                        if(notDetailsRes[counter][counter1].AdminEmailID){
                                                                            mailerApi.sendMailNew(mailTpl,{
                                                                                jobType : jobTypeList[jobType],
                                                                                jobTitle : jobTitle,
                                                                                jobCode : jobCode,
                                                                                companyName : notificationResult[1][0].cn,
                                                                                keySkills : (keySkills) ? keySkills : '',
                                                                                jobId : jobID
                                                                            },"New job posted for your institute",notDetailsRes[counter][counter1].AdminEmailID);
                                                                        }


                                                                        var notificationTemplaterRes = notificationTemplater.parse(pOnotificationTpl,{
                                                                            jobType : jobTypeList[jobType],
                                                                            jobTitle : jobTitle,
                                                                            jobCode : jobCode,
                                                                            companyName : notificationResult[1][0].cn // Who posted the job
                                                                        });

                                                                        if(notificationTemplaterRes.parsedTpl){
                                                                            notification.publish(
                                                                                notDetailsRes[counter][counter1].groupId,
                                                                                ezeoneId,
                                                                                ezeoneId,
                                                                                notDetailsRes[counter][counter1].groupId,
                                                                                notificationTemplaterRes.parsedTpl,
                                                                                8,
                                                                                0, notDetailsRes[counter][counter1].iphoneId,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                1,
                                                                                moment().format("YYYY-MM-DD HH:mm:ss"),
                                                                                '',
                                                                                0,
                                                                                jobID);
                                                                            console.log('postNotification : Job notification for Placement Officer is sent successfully');
                                                                        }
                                                                        else{
                                                                            console.log('Error in parsing notification '+notificationTpl+' template - ',
                                                                                notificationTemplaterRes.error);
                                                                            console.log('postNotification : Job notification for Placement Officer is not sent');
                                                                        }

                                                                    }

                                                                }

                                                            }
                                                        }

                                                    }
                                                    else{
                                                        console.log('err',err);
                                                        console.log('Something went wrong in executing combinedPOQuery',combinePOquery);
                                                    }

                                                });
                                            }
                                    }
                                    else {
                                        console.log('postNotification : Result not loaded');
                                    }
                                }
                                else {
                                    console.log('postNotification : Result not loaded');
                                }
                            });
                        };
                        var insertLocations = function(locationDetails){
                            var list = {
                                location_title: locationDetails.location_title,
                                latitude: locationDetails.latitude,
                                longitude: locationDetails.longitude,
                                country: locationDetails.country,
                                maptype : locationDetails.maptype
                            };
                            var queryParams = st.db.escape(list.location_title) + ',' + st.db.escape(list.latitude)
                                + ',' + st.db.escape(list.longitude) + ',' + st.db.escape(list.country)+ ',' + st.db.escape(list.maptype);
                            var locationInsertQuery = 'CALL psavejoblocation(' + queryParams + ')';
                            console.log('locationInsertQuery',locationInsertQuery);
                            st.db.query(locationInsertQuery, function (err, results) {
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            location_id += results[0][0].id + ',';
                                            locCount +=1;
                                            if(locCount < locationsList.length){
                                                insertLocations(locationsList[locCount]);
                                            }
                                            else{
                                                createJobPosting();
                                            }
                                        }
                                        else {
                                            console.log('FnSaveJobLocation:results no found');
                                            responseMessage.message = 'results no found';
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        console.log('FnSaveJobLocation:results no found');
                                        responseMessage.message = 'results no found';
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    console.log('FnSaveJobLocation:results no found');
                                    responseMessage.message = 'results no found';
                                    res.status(200).json(responseMessage);
                                }
                            });
                        };
                        //calling function at first time

                        console.log('locationList',locationsList);
                        if (locationsList) {
                            if (locationsList.length > 0) {
                                insertLocations(locationDetails);
                            }
                            else {
                                location_id = '';
                                createJobPosting();
                            }
                        }
                        else {
                            location_id = '';
                            createJobPosting();
                        }
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveJobs: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveJobs:Error in processing Token' + err);
                }
            });
        }
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnSaveJobs:error ' + ex);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};

function FnSaveSkills(skill, callBack) {
    try {
        //below query to check token exists for the users or not.
        if (skill != null) {
            var responseMessage = {
                SkillID: 0
            };
            st.db.query('Select SkillID from mskill where SkillTitle = ' + st.db.escape(skill.skillname) +' and functionid='+st.db.escape(skill.fid), function (err, skillResult) {
                if ((!err)) {
                    if (skillResult[0]) {
                        responseMessage.SkillID = skillResult[0].SkillID;
                        callBack(null, responseMessage);
                    }
                    else {
                        st.db.query('insert into mskill (SkillTitle,functionid) values (' + st.db.escape(skill.skillname) + ',' + st.db.escape(skill.fid) +')', function (err, skillInsertResult) {
                            if (!err) {
                                if (skillInsertResult.affectedRows > 0) {
                                    st.db.query('select SkillID from mskill where SkillTitle like ' + st.db.escape(skill.skillname), function (err, skillMaxResult) {
                                        if (!err) {
                                            if (skillMaxResult[0]) {
                                                //console.log('New Skill');
                                                responseMessage.SkillID = skillMaxResult[0].SkillID;
                                                callBack(null, responseMessage);
                                            }
                                            else {
                                                callBack(null, null);
                                            }
                                        }
                                        else {
                                            callBack(null, null);
                                        }
                                    });
                                }
                                else {
                                    callBack(null, null);
                                }
                            }
                            else {
                                callBack(null, null);
                            }
                        });
                    }
                }
                else {
                    callBack(null, null);
                }
            });
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('OTP FnSendMailEzeid error:' + ex);

        return 'error'
    }
};

/**
 * @todo FnGetJobs
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description  get jobs of a person based on ezeone_id
 */
Job.prototype.getAll = function(req,res,next){

    var token = req.query.token;
    var pageSize = (!isNaN(parseInt(req.query.page_size))) ?  parseInt(req.query.page_size) : 100;
    var pageCount = (!isNaN(parseInt(req.query.page_count))) ?  parseInt(req.query.page_count) : 0;
    var alumniCode = (req.query.a_code) ? req.query.a_code : '';
    var clientSort = (!isNaN(parseInt(req.query.cls))) ?  parseInt(req.query.cls) : 0;
    var clientQuery = (req.query.clq) ? req.query.clq : '';
    var contactSort = (!isNaN(parseInt(req.query.cts))) ?  parseInt(req.query.cts): 0;
    var contactQuery = (req.query.ctq) ? req.query.ctq : '';
    var jobCodeSort = (!isNaN(parseInt(req.query.jcs))) ?  parseInt(req.query.jcs) : 0;
    var jobCodeQuery = (req.query.jcq) ? req.query.jcq : '';
    var jobTitleSort = (!isNaN(parseInt(req.query.jts))) ?  parseInt(req.query.jts): 0;
    var jobTitleQuery = (req.query.jtq) ? req.query.jtq : '';
    var createdDateSort = (!isNaN(parseInt(req.query.cds))) ?  parseInt(req.query.cds): 0;
    var status = (req.query.sts) ?  req.query.sts: 0; // status date type is changed to varchar


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error ;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(pageSize) + ',' + st.db.escape(pageCount)
                            + ',' + st.db.escape(alumniCode)+ ',' + st.db.escape(clientSort) + ',' + st.db.escape(clientQuery)
                            + ',' + st.db.escape(contactSort) + ',' + st.db.escape(contactQuery) + ',' + st.db.escape(jobTitleSort)
                            + ',' + st.db.escape(jobTitleQuery)+ ',' + st.db.escape(createdDateSort) + ',' + st.db.escape(status)
                            + ',' + st.db.escape(jobCodeSort)+ ',' + st.db.escape(jobCodeQuery);

                        var query = 'CALL pGetJobs(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getresult) {

                            if (!err) {
                                if (getresult) {
                                    if (getresult[0]) {
                                        if (getresult[0][0]) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Jobs loaded successfully';
                                            responseMessage.data = {
                                                total_count: getresult[1][0].count,
                                                result : (getresult[0]) ? (getresult[0]) :[]
                                            };
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetJobs: Jobs loaded successfully');
                                        }
                                        else {
                                            responseMessage.message = 'No Jobs details found';
                                            console.log('FnGetJobs: No Jobs details found');
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'No Jobs details found';
                                        console.log('FnGetJobs: No Jobs details found');
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.message = 'No Jobs details found';
                                    console.log('FnGetJobs: No Jobs details found');
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server : 'Internal serever error'
                                };
                                responseMessage.message = 'Error getting from Jobs details';
                                console.log('FnGetJobs:Error from loading Jobs details:' + err);
                                res.status(500).json(responseMessage);
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
                        console.log('FnGetJobs: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetJobs:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server : 'Internal server error'
            };
            responseMessage.message = 'An error occured !';
            console.log('FnGetJobs:error ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(400).json(responseMessage);
        }
    }
};

/**
 * @todo FnGetJobLocations
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description  api code for job locations
 */
Job.prototype.getJobLocations = function(req,res,next){


    var responseMsg = {
        status : false,
        data : [],
        message : 'Unable to load Locations ! Please try again',
        error : {
            server : 'An internal server error'
        }
    };

    try{
        st.db.query('CALL pgetjoblocations()',function(err,result){
            if(err){
                console.log('Error : FnGetJobLocations ');
                res.status(400).json(responseMsg);
            }
            else{
                responseMsg.status = true;
                responseMsg.message = 'Locations loaded successfully';
                responseMsg.error = null;
                responseMsg.data = result[0];

                res.status(200).json(responseMsg);
            }
        });
    }

    catch(ex){
        res.status(500).json(responseMsg);
        console.log('Error : FnGetJobLocations '+ ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * @todo FnSearchJobs
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description search jobs of a person
 */
Job.prototype.searchJobs = function(req,res,next){
    try{
        var latitude = (req.query.latitude) ? req.query.latitude : 0.00;
        var longitude = (req.query.longitude) ? req.query.longitude : 0.00;
        var proximity = (req.query.proximity) ? req.query.proximity : 0;
        var jobType = (req.query.jobType) ? req.query.jobType : '';
        var exp = (req.query.exp) ? req.query.exp : -1;
        var keywords = (req.query.keywords) ? req.query.keywords : '';
        var token = (req.query.token) ? req.query.token : '';
        var pageSize = req.query.page_size;
        var pageCount = req.query.page_count;
        var locations = (req.query.locations) ? req.query.locations : '';
        var category = (req.query.category) ? req.query.category : '';
        var salary = (req.query.salary) ? req.query.salary : '';
        var filter = (req.query.filter) ? req.query.filter : 0;
        var restrictToInstitue = (req.query.restrict) ? req.query.restrict : 0;
        var type = req.query.type ? parseInt(req.query.type) : 0;  //0-normal job search, 1-Show my institue jobs, 2-for matching jobs of my cv and Default is 0
        var toEzeid = (req.query.to_ezeone) ? req.st.alterEzeoneId(req.query.to_ezeone) : '';
        var isAlumniSearch = (req.query.isalumni_search) ? req.st.alterEzeoneId(req.query.isalumni_search) : '';

        var responseMessage = {
            status: false,
            error: {},
            message: '',
            data: null
        };

        var query = st.db.escape(latitude) + ',' + st.db.escape(longitude) + ',' + st.db.escape(proximity)+ ',' + st.db.escape(jobType)
            + ',' + st.db.escape(exp) + ',' + st.db.escape(keywords)+',' + st.db.escape(token)+',' + st.db.escape(pageSize)
            +',' + st.db.escape(pageCount)+',' + st.db.escape(locations)+',' + st.db.escape(category)
            +',' + st.db.escape(salary)+',' + st.db.escape(filter)+',' + st.db.escape(restrictToInstitue)+',' + st.db.escape(type)
            +',' + st.db.escape(toEzeid)+',' + st.db.escape(isAlumniSearch);
        console.log('CALL psearchjobs(' + query + ')');
        st.db.query('CALL psearchjobs(' + query + ')', function (err, getResult) {
            console.log(getResult);

            if (!err) {
                if (getResult) {
                    if (getResult[0]) {
                        if (getResult[0][0]) {
                            if (getResult[1]) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Jobs Search result loaded successfully';
                                if (filter == 0) {
                                    responseMessage.data = {
                                        total_count: getResult[1][0].count,
                                        result: getResult[0],
                                        job_location: getResult[2],
                                        salary: getResult[3],
                                        category: getResult[4],
                                        company_details: getResult[5]
                                    };
                                }
                                else {
                                    responseMessage.data = {
                                        total_count: getResult[1][0].count,
                                        result: getResult[0]
                                    };
                                }
                                res.status(200).json(responseMessage);
                                console.log('FnSearchJobs: Jobs Search result loaded successfully');
                            }
                            else {
                                responseMessage.message = 'Search result not found';
                                res.status(200).json(responseMessage);
                                console.log('FnSearchJobs:Search result not found');
                            }
                        }
                        else {
                            responseMessage.message = 'Search result not found';
                            res.status(200).json(responseMessage);
                            console.log('FnSearchJobs:Search result not found');
                        }
                    }
                    else {
                        responseMessage.message = 'Search result not found';
                        res.status(200).json(responseMessage);
                        console.log('FnSearchJobs:Search result not found');
                    }
                }
                else {
                    responseMessage.message = 'Search result not found';
                    res.status(200).json(responseMessage);
                    console.log('FnSearchJobs:Search result not found');
                }
            }
            else {
                responseMessage.message = 'An error occured ! Please try again';
                responseMessage.error = {
                    server : 'Internal server error'
                };
                res.status(500).json(responseMessage);
                console.log('FnSearchJobs: error in getting job details:' + err);
            }
        });
    }
    catch(ex){
        responseMessage.error = {
            server : 'Internal server error'
        };
        responseMessage.message = 'An error occurred !';
        console.log('FnSearchJobs:error ' + ex);
        var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
        res.status(400).json(responseMessage);
    }
};

/**
 * @todo FnJobSeekerSearch
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for job seeker search
 */
Job.prototype.searchJobSeekers = function(req,res) {

    /**
     * checking input parameters are json or not
     */
    var isJson = req.is('json');

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        count: '',
        data: null
    };

    var validateStatus=true;
    var error={};

    if(!isJson){
        error['isJson'] = 'Invalid Input ContentType';
        validateStatus *= false;
    }
    else {
        var gender = (!isNaN(parseInt(req.body.gender))) ? parseInt(req.body.gender) : 2;
        var jobType = req.body.job_type;
        var salaryFrom = (parseFloat(req.body.salary_from) !== NaN && parseFloat(req.body.salary_from) > 0) ? parseFloat(req.body.salary_from) : 0;
        var salaryTo = (parseFloat(req.body.salary_to) !== NaN && parseFloat(req.body.salary_to) > 0) ? parseFloat(req.body.salary_to) : 0;
        var salaryType = (parseInt(req.body.salary_type) !== NaN && parseInt(req.body.salary_type) > 0) ? parseInt(req.body.salary_type) : 1;
        var experienceFrom = req.body.experience_from;
        var experienceTo = req.body.experience_to;
        var instituteId = (req.body.institute_id) ? req.body.institute_id : '';
        var pageSize = (req.body.page_size) ? req.body.page_size : 10;
        var pageCount = (req.body.page_count) ? req.body.page_count : 0;
        var source = req.body.source;   // 1-internal, 2-for ezeone cvs
        var token = req.body.token;
        var jobSkills = req.body.job_skills;
        jobSkills = JSON.parse(JSON.stringify(jobSkills));
        var educations = req.body.jobEducations;
        educations = JSON.parse(JSON.stringify(educations));
        var locMatrix = req.body.locMatrix;
        locMatrix = JSON.parse(JSON.stringify(locMatrix));

        req.body.skillKeywords = (req.body.skillKeywords) ? req.body.skillKeywords : '';

        var skillMatrix = ' ';
        var eduMatrix = ' ';
        var count;
        var loc = ' ';
        var educationMatrix = ' ';
        var locationsList = req.body.locationsList;
        if (typeof(locationsList) == "string") {
            locationsList = JSON.parse(locationsList);
        }
        var location_id = '';
        var locCount = 0;
        var locationIds;
        var filterType = (!isNaN(parseInt(req.body.filter_type))) ? parseInt(req.body.filter_type) : 0;

        if (!jobSkills) {
            jobSkills = [];
        }

        if(!token){
            error['token'] = 'token is mandatory';
            validateStatus *= false;
        }
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            var locationDetails = locationsList[locCount];

            var job = function (m, locationIds) {
                var ids = locationIds;

                if (m < jobSkills.length) {

                    var jskills = {
                        skillname: jobSkills[m].skillname,
                        expertiseLevel: jobSkills[m].expertiseLevel,
                        exp_from: jobSkills[m].exp_from,
                        exp_to: jobSkills[m].exp_to,
                        active_status: jobSkills[m].active_status,
                        fid: jobSkills[m].fid,
                        type: jobSkills[m].type
                    };


                    FnSaveSkills(jskills, function (err, idResult) {

                        if (skillMatrix == ' ') {

                            skillMatrix = ' (find_in_set(b.SkillID' + ',' + idResult.SkillID + ') and find_in_set(b.ExpertLevel' + ',' + JSON.stringify(jskills.expertiseLevel) + ' )' +
                                ' and b.ExpYrs>= ' + jskills.exp_from + ' and b.ExpYrs<= ' + jskills.exp_to + ' and ' +
                                ' find_in_set(b.SkillStatusID' + ',' + jskills.active_status + '))';
                        }
                        else {
                            skillMatrix = skillMatrix + ' or' + ' ( find_in_set(b.SkillID' + ',' + idResult.SkillID + ') and find_in_set(b.ExpertLevel' + ',' + JSON.stringify(jskills.expertiseLevel) + ' )' +
                                ' and b.ExpYrs>= ' + jskills.exp_from + ' and b.ExpYrs<= ' + jskills.exp_to + ' and ' +
                                ' find_in_set(b.SkillStatusID' + ',' + jskills.active_status + '))';
                        }
                        m = m + 1;
                        job(m, ids);
                    });

                }
                else {
                    if (skillMatrix != ' ') {
                        console.log('sending skill matrix..');
                        skillMatrix = ' and ( ' + skillMatrix + ')';
                        next(skillMatrix, ids);

                    }

                    else {
                        skillMatrix = '';
                        next(skillMatrix, ids);
                        console.log('skill matrix is empty..');
                    }
                }
            };

            var next = function (skillMatrix, locationIds) {
                var skillArray = skillMatrix;
                var locIds = locationIds;

                //educations
                if (educations.length) {
                    for (var j = 0; j < educations.length; j++) {
                        //async.each(educations, function iterator(eduDetails, callback) {

                        count = count - 1;

                        var eduSkills = {
                            education: educations[j].edu_id,
                            spc: educations[j].spc_id,
                            score_from: educations[j].score_from,
                            score_to: educations[j].score_to

                        };

                        if (eduMatrix == ' ') {

                            eduMatrix = ' (FIND_IN_SET(c.Educationid,' + '\'' + eduSkills.education + '\') ' +
                                'AND FIND_IN_SET(c.Specializationids,' + '\'' + eduSkills.spc + '\') ' +
                                'AND c.Score>=' + eduSkills.score_from + ' AND c.Score<=' + eduSkills.score_to + ')';
                        }
                        else {
                            eduMatrix = eduMatrix + ' or' + ' (FIND_IN_SET(c.Educationid,' + '\'' + eduSkills.education + '\') ' +
                                'AND FIND_IN_SET(c.Specializationids,' + '\'' + eduSkills.spc + '\') ' +
                                'AND c.Score>=' + eduSkills.score_from + ' AND c.Score<=' + eduSkills.score_to + ')';
                        }

                    }

                    if (eduMatrix != ' ') {
                        educationMatrix = ' and ( ' + eduMatrix + ')';
                    }
                }
                else {
                    educationMatrix = '';
                }

                //line of carrer
                if (locMatrix) {

                    count = count - 1;

                    var locSkills = {
                        fid: locMatrix.fid,
                        locIds: locMatrix.career_id,
                        exp_from: locMatrix.exp_from,
                        exp_to: locMatrix.exp_to,
                        level: locMatrix.expertiseLevel,
                        scoreFrom: locMatrix.score_from,
                        scoreTo: locMatrix.score_to

                    };

                    //(FIND_IN_SET(d.Functionid,array) AND FIND_IN_SET(d.LOCid,array) AND FIND_IN_SET(d.Level,array) AND d.Exp>=array AND d.Exp<=array )
                    if (loc == ' ') {

                        loc = //' and (FIND_IN_SET(d.Functionid,' + '\'' + locSkills.fid + '\') ' +
                            'AND FIND_IN_SET(d.LOCid,' + '\'' + locSkills.locIds + '\') '; //+
                            //'AND FIND_IN_SET(d.Level,' + '\'' + locSkills.level + '\') ' +
                            //'AND d.Exp>=' + locSkills.exp_from + ' AND d.Exp<=' + locSkills.exp_to +
                            //' AND d.Score >=' + locSkills.scoreFrom + ' AND d.Score <=' + locSkills.scoreTo + ')';
                    }

                }


                jobSeeker(skillArray, educationMatrix, loc, locIds,locSkills);
            };

            var jobSeeker = function (skillArray, educationMatrix, loc, locIds,locSkills) {

                var queryParams = st.db.escape(skillArray) + ',' + st.db.escape(jobType) + ',' + st.db.escape(salaryFrom)
                    + ',' + st.db.escape(salaryTo) + ',' + st.db.escape(salaryType) + ',' + st.db.escape(locIds)
                    + ',' + st.db.escape(experienceFrom) + ',' + st.db.escape(experienceTo) + ',' + st.db.escape(instituteId)
                    + ',' + st.db.escape(pageSize) + ',' + st.db.escape(pageCount) + ',' + st.db.escape(source)
                    + ',' + st.db.escape(token) + ',' + st.db.escape(educationMatrix) + ',' + st.db.escape(loc)
                    + ',' + st.db.escape(filterType)+',' + st.db.escape(gender)+',' + st.db.escape(locSkills.locIds) + ','+
                    st.db.escape(req.body.skillKeywords)+','+st.db.escape(req.body.flag);

                var query = 'CALL pGetjobseekers(' + queryParams + ')';
                console.log(query);
                st.db.query(query, function (err, getResult) {
                    //console.log(getResult);
                    if (!err) {
                        if (getResult) {
                            if (getResult[0]) {
                                if (getResult[0].length > 0) {
                                    if (getResult[1]) {
                                        if (getResult[1].length > 0) {
                                            for (var ct = 0; ct < getResult[1].length; ct++) {
                                                getResult[1][ct].surl = (getResult[1][ct].resumeurl) ?
                                                    (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + getResult[1][ct].resumeurl) : '';
                                                //console.log(getResult[1][ct]);
                                            }
                                        }
                                    }

                                    responseMessage.status = true;
                                    responseMessage.message = 'Job Seeker send successfully';
                                    responseMessage.count = getResult[0][0].count;
                                    responseMessage.data = getResult[1];
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetJobSeeker: Job Seeker send successfully');
                                }
                                else {
                                    responseMessage.message = 'Job Seeker not found';
                                    console.log('FnGetJobSeeker: Job Seeker not found');
                                    res.status(200).json(responseMessage);
                                }

                            }
                            else {
                                responseMessage.message = 'Job Seeker not found';
                                console.log('FnGetJobSeeker: Job Seeker not found');
                                res.status(200).json(responseMessage);
                            }

                        }
                        else {
                            responseMessage.message = 'Job Seeker not found';
                            console.log('FnGetJobSeeker: Job Seeker not found');
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'Error getting from Job Seeker';
                        console.log('FnGetJobSeeker:Error getting from Job Seeker:' + err);
                        res.status(500).json(responseMessage);
                    }
                });
            };

            // saving locations
            var insertLocations = function (locationDetails) {
                var list = {
                    location_title: locationDetails.location_title,
                    latitude: locationDetails.latitude,
                    longitude: locationDetails.longitude,
                    country: locationDetails.country,
                    maptype: locationDetails.maptype
                };

                var queryParams = st.db.escape(list.location_title) + ',' + st.db.escape(list.latitude)
                    + ',' + st.db.escape(list.longitude) + ',' + st.db.escape(list.country) + ',' + st.db.escape(list.maptype);
                console.log('CALL psavejoblocation(' + queryParams + ')');
                st.db.query('CALL psavejoblocation(' + queryParams + ')', function (err, results) {
                    if (results) {
                        if (results[0]) {
                            if (results[0][0]) {
                                location_id += results[0][0].id + ',';
                                locCount += 1;
                                if (locCount < locationsList.length) {
                                    insertLocations(locationsList[locCount]);
                                }
                                else {
                                    if (jobSkills) {
                                        var m = 0;
                                        locationIds = location_id;
                                        job(m, locationIds);
                                    }
                                    else {
                                        var skillMatrix = '';
                                        locationIds = location_id;
                                        next(skillMatrix, locationIds);
                                        console.log('FnGetJobSeeker : skill is empty');
                                    }
                                }
                            }
                            else {
                                console.log('FnSaveJobLocation:results no found');
                                responseMessage.message = 'results no found';
                                res.status(200).json(responseMessage);
                            }
                        }
                        else {
                            console.log('FnSaveJobLocation:results no found');
                            responseMessage.message = 'results no found';
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        console.log('FnSaveJobLocation:results no found');
                        responseMessage.message = 'results no found';
                        res.status(200).json(responseMessage);
                    }
                });
            };
            //calling function at first time

            if (locationsList) {
                if (locationsList.length > 0) {
                    insertLocations(locationDetails);
                }
                else {
                    locationIds = '';
                    if (jobSkills) {
                        var m = 0;
                        job(m, locationIds);

                    }
                    else {
                        var skillMatrix = '';
                        next(skillMatrix, locationIds);
                        console.log('FnGetJobSeeker : skill is empty');
                    }
                }

            }

            else {
                locationIds = '';
                if (jobSkills) {
                    var m = 0;
                    job(m, locationIds);

                }
                else {
                    var skillMatrix = '';
                    next(skillMatrix, locationIds);
                    console.log('FnGetJobSeeker : skill is empty');
                }
            }

        }

        catch (ex) {
            responseMessage.error = {
                server: 'Internal server error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnJobSeekerSearch ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

/**
 * @todo FnApplyJob
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for apply job
 */
Job.prototype.applyJob = function(req,res,next){

    var token = req.body.token;
    var jobId = req.body.job_id;
    var status = (!isNaN(parseInt(req.body.status))) ?  parseInt(req.body.status) : 3;   // 1-accepted, 2-reject, 3-applied

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
    if(!jobId){
        error['jobId'] = 'Invalid job ID';
        validateStatus *= false;
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
                        var query = st.db.escape(jobId) + ',' + st.db.escape(token)+ ',' + st.db.escape(status);
                        console.log('CALL pApplyjob(' + query + ')');
                        st.db.query('CALL pApplyjob(' + query + ')', function (err, insertResult) {
                            if (!err) {
                                console.log(insertResult);
                                if (insertResult[0]) {
                                    if (insertResult[0][0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Job apply successfully';
                                        responseMessage.data = insertResult[0][0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnApplyJob: Job apply successfully');
                                        if (insertResult[0][0].Status == 0){
                                            var dateTime = moment().format('MMMM Do YYYY, h:mm:ss a'); // April 21st 2016, 5:54:50 pm
                                           var notificationQueryParams = st.db.escape(token) + ',' + st.db.escape(jobId);
                                           var notificationQuery = 'CALL pnotify_jobcreator_afterApply(' + notificationQueryParams + ')';
                                           console.log(notificationQuery);
                                           st.db.query(notificationQuery, function (err, notDetailsRes) {
                                               console.log(notDetailsRes);
                                               if (notDetailsRes && notDetailsRes[0]) {
                                                   console.log("hello");
                                                   for (var count = 0; count < notDetailsRes[0].length; count++) {
                                                       if (notDetailsRes[0][count].userRights){
                                                           if ((!isNaN(parseInt(notDetailsRes[0][count].userRights.split('')[4]))) &&
                                                               parseInt(notDetailsRes[0][count].userRights.split('')[4]) > 0 ){
                                                               var fn = (insertResult[0][0].FirstName) ? insertResult[0][0].FirstName : insertResult[0][0].EZEID
                                                               if (notDetailsRes[0][count].ispo){
                                                                   var receiverId = notDetailsRes[0][count].receiverId;
                                                                   var senderTitle = insertResult[0][0].EZEID;
                                                                   var groupTitle = notDetailsRes[0][count].groupTitle;
                                                                   var groupId = notDetailsRes[0][count].groupId;
                                                                   var messageText = 'Name has applied to job';
                                                                   /**
                                                                    * messageType 22 when student will apply to job who has posted
                                                                    * job and placement officer if verified college will get notification
                                                                    *
                                                                    */
                                                                   var messageType = 22;
                                                                   var operationType = 0;
                                                                   var iphoneId = notDetailsRes[0][count].iphoneId;
                                                                   var messageId = 0;
                                                                   var masterid = notDetailsRes[0][count].masterid;
                                                                   var latitude = '';
                                                                   var longitude = '';
                                                                   var prioritys = '';
                                                                   var a_name = '';
                                                                   var msgUserid = '';
                                                                   var jid = jobId;

                                                                   console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType,
                                                                       operationType, iphoneId, messageId, masterid);
                                                                   notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText,
                                                                       messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys,
                                                                       dateTime, a_name, msgUserid, jid);
                                                                   console.log('Job Post Notification Send Successfully');
                                                                   /**
                                                                    * @TODO add mail template functionality is already added
                                                                    * mail to placement officer when stundent has applied to any job
                                                                    */
                                                                   //if (notDetailsRes[0][count].CVMailID){
                                                                   //    mailerApi.sendMail('sales_lead_template', {
                                                                   //        ezeoneId : insertResult[0][0].EZEID,
                                                                   //        message : 'salesEnquiryMessage'
                                                                   //
                                                                   //    }, '', notDetailsRes[0][count].CVMailID);
                                                                   //}

                                                               }
                                                               else {
                                                                   console.log("comming to this block");
                                                                   var receiverId = notDetailsRes[0][count].receiverId;
                                                                   var senderTitle = insertResult[0][0].EZEID;
                                                                   var groupTitle = notDetailsRes[0][count].groupTitle;
                                                                   var groupId = notDetailsRes[0][count].groupId;
                                                                   var messageText = fn +' has applied to job';
                                                                   /**
                                                                    * messageType 24 when student will apply to job company who has posted job
                                                                    * will get notification and mail
                                                                    */
                                                                   var messageType = 24;
                                                                   var operationType = 0;
                                                                   var iphoneId = notDetailsRes[0][count].iphoneId;
                                                                   var messageId = 0;
                                                                   var masterid = notDetailsRes[0][count].masterid;
                                                                   console.log(receiverId, senderTitle, groupTitle, groupId, messageText,
                                                                       messageType, operationType, iphoneId, messageId, masterid);

                                                                   /**
                                                                    * Send notification to those users who are falling under the category of the folder
                                                                    * which is assigned to this lead
                                                                    */
                                                                   notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText,
                                                                       messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys,
                                                                       dateTime, a_name, msgUserid, jid);
                                                                   console.log("Notification Send");

                                                                   if (notDetailsRes[0][count].CVMailID){
                                                                       mailerApi.sendMail('job_apply_comapney_template', {
                                                                           ezeoneId : insertResult[0][0].EZEID,
                                                                           JobType : (insertResult[0][0].JobType) ? insertResult[0][0].JobType : 'FullTime',
                                                                           JobTitle : insertResult[0][0].JobTitle,
                                                                           JobCode : insertResult[0][0].JobCode,
                                                                           DateTime : dateTime
                                                                       }, '', notDetailsRes[0][count].CVMailID);
                                                                   }
                                                               }
                                                           }
                                                       }
                                                   }
                                               }
                                               else {
                                                   console.log('get_subuser_enquiry:user details not loaded');
                                               }
                                           });

                                       }
                                    }
                                    else {
                                        responseMessage.message = 'Job not apply';
                                        res.status(200).json(responseMessage);
                                        console.log('FnApplyJob:Job not apply');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Job not apply';
                                    res.status(200).json(responseMessage);
                                    console.log('FnApplyJob:Job not apply');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnApplyJob: error in saving Job applied :' + err);
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
                        console.log('FnApplyJob: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnApplyJob:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnApplyJob ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnAppliedJobList
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for applied job list
 */
Job.prototype.appliedJobList = function(req,res,next){

    var jobId = req.query.job_id;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!jobId){
        error['jobId'] = 'Invalid job ID';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            //console.log('CALL pgetlistofcandappliedforjob(' + st.db.escape(jobId) + ')');
            st.db.query('CALL pgetlistofcandappliedforjob(' + st.db.escape(jobId) + ')', function (err, getResult) {
                if (!err) {
                    if (getResult) {
                        if(getResult[0]){
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Applied job List loaded successfully';
                            responseMessage.data = getResult[0];
                            res.status(200).json(responseMessage);
                            console.log('FnAppliedJobList: Applied job List loaded successfully');
                        }
                        else {
                            responseMessage.message = 'Applied job List not loaded';
                            res.status(200).json(responseMessage);
                            console.log('FnAppliedJobList:Applied job List not loaded');
                        }
                    }
                    else {
                        responseMessage.message = 'Applied job List not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnAppliedJobList:Applied job List not loaded');
                    }
                }
                else {
                    responseMessage.message = 'An error occured ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnAppliedJobList: error in saving Applied job list :' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnAppliedJobList ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetJobDetails
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get job details
 */
Job.prototype.getJobDetails = function(req,res,next){

    var token = (req.query.token) ? req.query.token : null;
    var jobId = req.query.job_id;
    var latitude = (req.query.lat) ? req.query.lat : '';
    var longitude = (req.query.lng) ? req.query.lng : '';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!jobId){
        error['jobId'] = 'Invalid job ID';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            //st.validateToken(token, function (err, result) {
            //    if (!err) {
            //        if (result) {
                        var queryParams = st.db.escape(jobId) + ',' + st.db.escape(token)+ ',' + st.db.escape(latitude)
                            + ',' + st.db.escape(longitude);
                        var query = 'CALL pgetjobDetails(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Job Details loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetJobDetails: Job Details loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Job Details not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetJobDetails:Job Details not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Job Details not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetJobDetails:Job Details not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetJobDetails: error in getting Job Details :' + err);
                            }
                        });
            //        }
            //        else {
            //            responseMessage.message = 'Invalid token';
            //            responseMessage.error = {
            //                token: 'invalid token'
            //            };
            //            responseMessage.data = null;
            //            res.status(401).json(responseMessage);
            //            console.log('FnLoadMessages: Invalid token');
            //        }
            //    }
            //    else {
            //        responseMessage.error = {
            //            server : 'Internal server error'
            //        };
            //        responseMessage.message = 'Error in validating Token';
            //        res.status(500).json(responseMessage);
            //        console.log('FnLoadMessages:Error in processing Token' + err);
            //    }
            //});
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetJobDetails ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnJobs
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description  get jobs of a person based on ezeone_id
 */
Job.prototype.jobs = function(req,res,next){

    var ezeone_id = req.st.alterEzeoneId(req.query.ezeone_id);
    var token = req.query.token;
    var keywordsForSearch = req.query.keywordsForSearch;
    var status = req.query.status;
    var pageSize = req.query.page_size;
    var pageCount = req.query.page_count;
    var orderBy = req.query.order_by;
    var alumniCode = (req.query.a_code) ? req.query.a_code : '';// 1-ascending else descending
    var output=[];
    //console.log(req.query);

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validateStatus = true;
    var error = {};

    if(!ezeone_id){
        error['ezeone_id'] = 'Invalid ezeone_id';
        validateStatus *= false;
    }
    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error ;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(ezeone_id) + ',' + st.db.escape(keywordsForSearch)  + ',' + st.db.escape(status)
                            + ',' + st.db.escape(pageSize) + ',' + st.db.escape(pageCount)  + ',' + st.db.escape(orderBy)
                            + ',' + st.db.escape(alumniCode);

                        var query = 'CALL pGetJobs(' + queryParams + ')';

                        console.log(query);
                        st.db.query(query, function (err, getresult) {
                            console.log(err);
                            if (!err) {
                                if (getresult) {
                                    if (getresult[0]) {
                                        if (getresult[0][0]) {
                                            if (getresult[0][0].length > 0) {

                                                for (var i = 0; i < getresult[0].length; i++) {
                                                    var data = {
                                                        tid: getresult[0][i].tid,
                                                        jobcode: getresult[0][i].jobcode,
                                                        jobtitle: getresult[0][i].jobtitle
                                                    };
                                                    output.push(data);
                                                }
                                                //console.log(output);
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Jobs loaded successfully';
                                                responseMessage.data = {
                                                    result: output
                                                };
                                                res.status(200).json(responseMessage);
                                                console.log('FnJobs: Jobs loaded successfully');
                                            }
                                            else {
                                                responseMessage.message = 'Jobs not loaded ';
                                                console.log('FnJobs: Jobs not loaded');
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {

                                            responseMessage.message = 'Jobs not loaded ';
                                            console.log('FnJobs: Jobs not loaded');
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {

                                        responseMessage.message = 'Jobs not loaded';
                                        console.log('FnJobs: Jobs not loaded');
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.message = 'Jobs not loaded';
                                    console.log('FnJobs:Jobs not loaded');
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server : 'Internal serever error'
                                };
                                responseMessage.message = 'Error getting from Jobs ';
                                console.log('FnJobs:Error getting from Jobs:' + err);
                                res.status(500).json(responseMessage);
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
                        console.log('FnJobs: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnJobs:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server : 'Internal server error'
            };
            responseMessage.message = 'An error occured !';
            console.log('FnJobs:error ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(400).json(responseMessage);
        }
    }
};

/**
 * @todo FnGetAppliedJob
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for applied job list
 */
Job.prototype.getAppliedJob = function(req,res,next){

    var token = req.query.token;
    var pageSize = req.query.page_size;
    var pageCount = req.query.page_count;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        count : 0,
        data: []
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(pageSize) + ',' + st.db.escape(pageCount);
                        var query = 'CALL pGetAppliedJobs(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0][0]) {
                                            if (getResult[1]) {

                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Applied job List loaded successfully';
                                                responseMessage.count = getResult[0][0].count;
                                                responseMessage.data = getResult[1];
                                                res.status(200).json(responseMessage);
                                                console.log('FnAppliedJobList: Applied job List loaded successfully');
                                            }
                                            else {
                                                responseMessage.message = 'Applied job List not loaded';
                                                res.status(200).json(responseMessage);
                                                console.log('FnAppliedJobList:Applied job List not loaded');
                                            }
                                        }
                                        else {

                                            responseMessage.message = 'Applied job List not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnAppliedJobList:Applied job List not loaded');
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'Applied job List not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnAppliedJobList:Applied job List not loaded');
                                    }
                                }
                                else {

                                    responseMessage.message = 'Applied job List not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnAppliedJobList:Applied job List not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnAppliedJobList: error in saving Applied job list :' + err);
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
                        console.log('FnAppliedJobList: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnAppliedJobList:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnAppliedJobList ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetJobcountry
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description  api code for job locations
 */
Job.prototype.getJobcountry = function(req,res,next){


    var responseMsg = {
        status : false,
        data : [],
        message : 'Unable to load Job country ! Please try again',
        error : {
            server : 'An internal server error'
        }
    };

    try{
        st.db.query('CALL pGetJobcountryList()',function(err,result){
            if(err){
                console.log('Error : FnGetJobcountry: '+ err);
                res.status(400).json(responseMsg);
            }
            else{
                responseMsg.status = true;
                responseMsg.message = 'Country loaded successfully';
                responseMsg.error = null;
                responseMsg.data = result[0];

                res.status(200).json(responseMsg);
            }
        });
    }

    catch(ex){
        res.status(500).json(responseMsg);
        console.log('Error : FnGetJobcountry '+ ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * @todo FnGetjobcity
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description  api code for job locations
 */
Job.prototype.getjobcity = function(req,res,next){


    var countryTitle = req.query.country_title;

    var responseMsg = {
        status : false,
        data : [],
        message : 'Unable to Get job city ! Please try again',
        error : {
            server : 'An internal server error'
        }
    };

    try{
        st.db.query('CALL pGetjobcities(' + st.db.escape(countryTitle) + ')',function(err,result){
            if(err){
                console.log('Error : FnGetjobcity: '+ err);
                res.status(400).json(responseMsg);
            }
            else {
                if (result) {
                    if (result[0]) {

                        responseMsg.status = true;
                        responseMsg.message = 'City loaded successfully';
                        responseMsg.error = null;
                        responseMsg.data = result[0];
                        res.status(200).json(responseMsg);
                    }
                    else {
                        res.status(200).json(responseMsg);
                    }
                }
                else {
                    res.status(200).json(responseMsg);
                }
            }
        });
    }

    catch(ex){
        res.status(500).json(responseMsg);
        console.log('Error : FnGetjobcity '+ ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * @todo FnJobSeekersMessage
 * Method : post
 * @param req
 * @param res
 * @param next
 * @description api code for Get Job Seekers Mail Details
 */
Job.prototype.jobSeekersMessage = function(req,res,next){

    var fs = require("fs");
    var token = req.body.token;
    var ids = req.body.ids;
    var templateId = req.body.template_id;
    var jobTitle = req.body.job_title;
    var jobId = req.body.job_id;
    var mailFlag = parseInt(req.body.mailflag);
    var id;
    var i;
    var tid;
    var jobResult;
    var messageContent;
    var link;

    if(ids){
        id = ids.split(",");
        //console.log(id.length);
        //console.log(id);
    }

    var responseMessage = {
        status: true,
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
    if(!ids){
        error['ids'] = 'Invalid ids';
        validateStatus *= false;
    }
    if(!templateId){
        error['templateId'] = 'Invalid templateId';
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

                        var mailDetails = function(i) {
                            if(i < id.length) {
                                tid = id[i];
                                var queryParams = st.db.escape(token) + ',' + st.db.escape(tid);
                                var query = 'CALL pGetjobseekersmailDetails(' + queryParams + ')';
                                //console.log(query);
                                st.db.query(query, function (err, getResult) {
                                    if (!err) {
                                        if (getResult) {
                                            if (getResult[0]) {
                                                console.log('FnGetJobSeekersMailDetails: Result loaded successfully');
                                                sendJobMessage(getResult,tid);
                                            }
                                            else {
                                                console.log('FnSendJobMessage:Result not found');
                                                sendJobMessage(null,null);
                                            }
                                        }
                                        else {
                                            console.log('FnSendJobMessage:Result not found');
                                            sendJobMessage(null,null);
                                        }
                                    }
                                    else {
                                        console.log('FnSendJobMessage:Error:' + err);
                                        sendJobMessage(null,null);
                                    }
                                });
                            }
                        };

                        var sendJobMessage = function (getResult,tid) {
                            jobResult = getResult;
                            //console.log(jobResult);
                            i+=1;
                            if(jobResult) {
                                if (jobResult[0]) {
                                    if (jobResult[0][0]) {

                                        tid = tid;
                                        var templateQuery = 'Select * from mmailtemplate where TID = ' + st.db.escape(templateId);
                                        st.db.query(templateQuery, function (err, TemplateResult) {

                                            if (!err) {
                                                if (TemplateResult) {
                                                    if (TemplateResult.length > 0) {
                                                        if (TemplateResult[0]) {
                                                            //console.log(TemplateResult);
                                                            var path = require('path');
                                                            var file = path.join(__dirname, '../../mail/templates/jobseeker_mail.html');

                                                            fs.readFile(file, "utf8", function (err, data) {

                                                                messageContent = TemplateResult[0].Body;
                                                                messageContent = messageContent.replace("{FirstName}", jobResult[0][0].FirstName);
                                                                messageContent = messageContent.replace("{LastName}", jobResult[0][0].LastName);
                                                                messageContent = messageContent.replace("{CompanyName}", jobResult[0][0].CompanyName);
                                                                messageContent = messageContent.replace("{JobTitle}", jobTitle);

                                                                data = data.replace("{JobID}", jobId);
                                                                messageContent = messageContent.replace("{link}", data);


                                                                fs.writeFile("jobseeker.html", messageContent, function (err) {
                                                                    if (!err) {
                                                                        fs.exists('./jobseeker.html', function (exists) {
                                                                            if (exists) {
                                                                                fs.readFile("jobseeker.html", "utf8", function (err, dataResult) {
                                                                                    if (!err) {
                                                                                        if (dataResult) {
                                                                                            if (mailFlag == 0) {
                                                                                                if (jobResult[0][0].EZEID) {
                                                                                                    var queryParams = st.db.escape(dataResult) + ',' + st.db.escape('') + ',' + st.db.escape('')
                                                                                                        + ',' + st.db.escape(1) + ',' + st.db.escape('') + ',' + st.db.escape('')
                                                                                                        + ',' + st.db.escape(token) + ',' + st.db.escape(0) + ',' + st.db.escape(jobResult[0][0].masterid)
                                                                                                        + ',' + st.db.escape(1) + ',' + st.db.escape('') + ',' + st.db.escape(1) + ',' + st.db.escape(0);
                                                                                                    var query = 'CALL pComposeMessage(' + queryParams + ')';
                                                                                                    console.log(query);
                                                                                                    st.db.query(query, function (err, result) {
                                                                                                        if (!err) {
                                                                                                            if (result) {

                                                                                                                console.log('FnGetJobSeekersMailDetails: JobSeeker Message Send Successfully');
                                                                                                                mailDetails(i);
                                                                                                                fs.unlinkSync('jobseeker.html');
                                                                                                                console.log('successfully deleted html file');
                                                                                                                var query = 'CALL pUpdateMailCountForCV(' + st.db.escape(tid) + ')';
                                                                                                                st.db.query(query, function (err, result) {
                                                                                                                    if (!err) {
                                                                                                                        console.log('FnUpdateMail:UpdateMailCountForCV success');
                                                                                                                    }
                                                                                                                    else {
                                                                                                                        console.log(err);
                                                                                                                    }
                                                                                                                });
                                                                                                            }
                                                                                                            else {
                                                                                                                console.log('FnSendMessage: Message not Saved Successfully');
                                                                                                                mailDetails(i);
                                                                                                            }

                                                                                                        }
                                                                                                        else {
                                                                                                            console.log('FnSendMessage: Message not Saved Successfully');
                                                                                                            mailDetails(i);
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                                else {
                                                                                                    mailDetails(i);
                                                                                                }

                                                                                            }
                                                                                            else {
                                                                                                if (jobResult[0][0].EZEID) {
                                                                                                    var queryParams = st.db.escape(dataResult) + ',' + st.db.escape('') + ',' + st.db.escape('')
                                                                                                        + ',' + st.db.escape(1) + ',' + st.db.escape('') + ',' + st.db.escape('')
                                                                                                        + ',' + st.db.escape(token) + ',' + st.db.escape(0) + ',' + st.db.escape(jobResult[0][0].masterid)
                                                                                                        + ',' + st.db.escape(1) + ',' + st.db.escape('') + ',' + st.db.escape(1) + ',' + st.db.escape(0);
                                                                                                    var query = 'CALL pComposeMessage(' + queryParams + ')';
                                                                                                    //console.log(query);
                                                                                                    st.db.query(query, function (err, result) {
                                                                                                        if (!err) {
                                                                                                            if (result) {
                                                                                                                if (jobResult[0][0].AdminEmailID) {
                                                                                                                    //console.log(TemplateResult);
                                                                                                                    var mailOptions = {
                                                                                                                        from: 'noreply@ezeone.com',
                                                                                                                        to: jobResult[0][0].AdminEmailID,
                                                                                                                        subject: TemplateResult[0].Subject,
                                                                                                                        html: dataResult
                                                                                                                    };

                                                                                                                    //console.log(mailOptions);

                                                                                                                    var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                                                                                                    sendgrid.send(mailOptions, function (error, result) {
                                                                                                                        console.log(error);
                                                                                                                        if (!error) {

                                                                                                                            console.log('Mail sent successfully...');

                                                                                                                            console.log('FnGetJobSeekersMailDetails: JobSeeker Message Send Successfully');
                                                                                                                            mailDetails(i);
                                                                                                                            fs.unlinkSync('jobseeker.html');
                                                                                                                            console.log('successfully deleted html file');
                                                                                                                            var query = 'CALL pUpdateMailCountForCV(' + st.db.escape(tid) + ')';
                                                                                                                            st.db.query(query, function (err, result) {
                                                                                                                                if (!err) {
                                                                                                                                    console.log('FnUpdateMail:UpdateMailCountForCV success');
                                                                                                                                }
                                                                                                                                else {
                                                                                                                                    console.log(err);
                                                                                                                                }
                                                                                                                            });
                                                                                                                        }
                                                                                                                        else {
                                                                                                                            console.log('FnSendMessage: Mail not Send Successfully');
                                                                                                                            mailDetails(i);
                                                                                                                        }
                                                                                                                    });
                                                                                                                }
                                                                                                                else {
                                                                                                                    console.log('FnSendMessage: Email Id is empty');
                                                                                                                    mailDetails(i);
                                                                                                                }
                                                                                                            }
                                                                                                            else {
                                                                                                                console.log('FnSendMessage: Message not Saved Successfully');
                                                                                                                mailDetails(i);
                                                                                                            }

                                                                                                        }
                                                                                                        else {
                                                                                                            console.log('FnSendMessage: Message not Saved Successfully');
                                                                                                            mailDetails(i);
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                                else {
                                                                                                    console.log('ezeid is empty');
                                                                                                    if (jobResult[0][0].AdminEmailID) {

                                                                                                        var mailOptions = {
                                                                                                            from: 'noreply@ezeone.com',
                                                                                                            to: jobResult[0][0].AdminEmailID,
                                                                                                            subject: TemplateResult[0].Subject,
                                                                                                            html: dataResult
                                                                                                        };
                                                                                                        //console.log(mailOptions);

                                                                                                        var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                                                                                        sendgrid.send(mailOptions, function (error, result) {
                                                                                                            console.log(error);
                                                                                                            if (!error) {
                                                                                                                console.log('Mail sent successfully...');
                                                                                                                mailDetails(i);
                                                                                                                fs.unlinkSync('jobseeker.html');
                                                                                                            }
                                                                                                            else {
                                                                                                                console.log('Mail not sent successfully...');
                                                                                                                mailDetails(i);
                                                                                                            }
                                                                                                        });
                                                                                                    }
                                                                                                    else {
                                                                                                        mailDetails(i);
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                        else {
                                                                                            console.log('FnGetJobSeekersMailDetails: HtmlFile not loaded');
                                                                                        }
                                                                                    }
                                                                                    else {
                                                                                        console.log('FnGetJobSeekersMailDetails: Error in reading html file');
                                                                                    }
                                                                                });
                                                                            }
                                                                            else {
                                                                                console.log('FnGetJobSeekersMailDetails: not exists');
                                                                            }
                                                                        });
                                                                    }
                                                                    else {
                                                                        console.log('FnGetJobSeekersMailDetails: File not write');
                                                                    }
                                                                });
                                                            });
                                                        }
                                                        else {
                                                            console.log('FnGetJobSeekersMailDetails: TemplateResult not loaded');
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnGetJobSeekersMailDetails: Result not loaded');
                                                    }
                                                }
                                                else {
                                                    console.log('FnGetJobSeekersMailDetails: Result not loaded');
                                                }
                                            }
                                            else {
                                                console.log('FnGetJobSeekersMailDetails: error:' + err);
                                            }
                                        });
                                    }
                                    else
                                    {
                                        mailDetails(i);
                                    }
                                }
                                else {
                                    mailDetails(i);
                                }
                            }
                            else
                            {
                                mailDetails(i);
                            }
                        };
                        if (id.length > 0) {
                            i=0;
                            mailDetails(i);
                        }
                        else {
                            console.log('FnJobSeekerMail:Invalid ids');
                        }
                        responseMessage.message = 'JobSeeker Message Send Successfully';
                        responseMessage.data = {
                            token : req.body.token,
                            ids : req.body.ids,
                            templateId : req.body.template_id,
                            jobId : req.body.job_id
                        };
                        res.status(200).json(responseMessage);
                        console.log('FnGetJobSeekersMailDetails: JobSeeker Message Send Successfully..');

                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnGetJobSeekersMailDetails: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetJobSeekersMailDetails:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetJobSeekersMailDetails ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetListOfJobs
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for applied job list
 */
Job.prototype.getListOfJobs = function(req,res,next){

    var token = req.query.token;

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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(token);
                        var query = 'CALL PgetListofjobs(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'job List loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetListOfJobs: Applied job List loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'job List not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetListOfJobs:job List not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'job List not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetListOfJobs:job List not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetListOfJobs: error in saving job list :' + err);
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
                        console.log('FnGetListOfJobs: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetListOfJobs:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetListOfJobs ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnJobRefresh
 * Method : put
 * @param req
 * @param res
 * @param next
 * @description api code for get job refresh
 */
Job.prototype.jobRefresh = function(req,res,next){

    var token = req.body.token;
    var jobId = req.body.job_id;

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
    if(!jobId){
        error['jobId'] = 'Invalid job ID';
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
                        //console.log('CALL pRefreshJob(' + st.db.escape(jobId) + ')');
                        st.db.query('CALL pRefreshJob(' + st.db.escape(jobId) + ')', function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Jobs refreshed successfully';
                                    res.status(200).json(responseMessage);
                                    console.log('FnJobRefresh: Jobs refreshed successfully');
                                }
                                else {
                                    responseMessage.message = 'Jobs not refreshed';
                                    res.status(200).json(responseMessage);
                                    console.log('FnJobRefresh:Jobs not refreshed');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnJobRefresh: error in getting JobRefresh :' + err);
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
                        console.log('FnJobRefresh: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnJobRefresh:Error in processing Token' + err);
                }
            });
        }

        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnJobRefresh ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnJobsMatch
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get job match
 */
Job.prototype.jobsMatch = function(req,res,next){

    var token = req.query.token;

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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        //console.log('CALL pShowMatchingJobsofCV(' + st.db.escape(token) + ')');
                        st.db.query('CALL pShowMatchingJobsofCV(' + st.db.escape(token) + ')', function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0][0]) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.data = getResult[0][0];
                                            responseMessage.message = 'Jobs Matched successfully';
                                            res.status(200).json(responseMessage);
                                            console.log('FnJobsMatch: Jobs Matched successfully');
                                        }
                                        else {
                                            responseMessage.message = 'Jobs not Matched';
                                            res.status(200).json(responseMessage);
                                            console.log('FnJobsMatch:Jobs not Matched');
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'Jobs not Matched';
                                        res.status(200).json(responseMessage);
                                        console.log('FnJobsMatch:Jobs not Matched');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Jobs not Matched';
                                    res.status(200).json(responseMessage);
                                    console.log('FnJobsMatch:Jobs not Matched');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnJobsMatch: error in getting JobsMatch :' + err);
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
                        console.log('FnJobsMatch: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnJobsMatch:Error in processing Token' + err);
                }
            });
        }

        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnJobsMatch ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnJobsMyInstitute
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get job MyInstitute
 */
Job.prototype.jobsMyInstitute = function(req,res,next){

    var token = req.query.token;
    var latitude = req.query.latitude;
    var longitude = req.query.longitude;

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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(latitude)+ ',' + st.db.escape(longitude);
                        var query = 'CALL pShowMyInstituteJob(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.data = getResult[0];
                                        responseMessage.message = 'Jobs Loaded successfully';
                                        res.status(200).json(responseMessage);
                                        console.log('FnJobsMyInstitute: Jobs Loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Jobs not Loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnJobsMyInstitute:Jobs not Loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Jobs not Loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnJobsMyInstitute:Jobs not Loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnJobsMyInstitute: error in getting JobsMatch :' + err);
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
                        console.log('FnJobsMyInstitute: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnJobsMyInstitute:Error in processing Token' + err);
                }
            });
        }

        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnJobsMatch ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnNotifyRelevantStudent
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get notify RelevantStudent
 */
Job.prototype.notifyRelevantStudent = function(req,res,next){

    var token = req.query.token;
    var jobId = parseInt(req.query.job_id);

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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(jobId) + ',' + st.db.escape(token);
                        var query = 'CALL PNotifyRelevantStudent(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.data = getResult[0];
                                        responseMessage.message = 'Result loaded successfully';
                                        res.status(200).json(responseMessage);
                                        console.log('FnNotifyRelevantStudent: Result loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Result not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnNotifyRelevantStudent:Result not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Result not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnNotifyRelevantStudent:Result not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnNotifyRelevantStudent: error :' + err);
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
                        console.log('FnNotifyRelevantStudent: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnNotifyRelevantStudent:Error in processing Token' + err);
                }
            });
        }

        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnNotifyRelevantStudent ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnViewApplicantList
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for view cv details
 */
Job.prototype.viewApplicantList = function(req,res,next){

    var token = req.query.token;
    var cvId = req.query.cv_ids;

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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(cvId);
                        var query = 'CALL pViewNotifiedCVDetails(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.data = getResult[0];
                                        responseMessage.message = 'CVDetails loaded successfully';
                                        res.status(200).json(responseMessage);
                                        console.log('FnViewNotifiedCVDetails: CVDetails loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'CVDetails not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnViewNotifiedCVDetails:CVDetails not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'CVDetails not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnViewNotifiedCVDetails:CVDetails not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnViewNotifiedCVDetails: error getting from CVDetails:' + err);
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
                        console.log('FnViewNotifiedCVDetails: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnViewNotifiedCVDetails:Error in processing Token' + err);
                }
            });
        }

        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnViewNotifiedCVDetails ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnViewJobDetails
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for view job details
 */
Job.prototype.viewJobDetails = function(req,res,next){

    var token = req.query.token;
    var jobId = req.query.job_id;

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

    if(!jobId){
        error['jobId'] = 'Invalid job ID';
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
                        var queryParams =  st.db.escape(jobId);
                        var query = 'CALL pviewjobDetails(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if(getResult[0]){
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Job Details loaded successfully';
                                        responseMessage.data = {
                                            result: getResult[0],
                                            location : getResult[1],
                                            skill:getResult[2],
                                            line_of_career : getResult[3],
                                            educations : getResult[4],
                                            institute :  getResult[5]
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnViewJobDetails: Job Details loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Job Details not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnViewJobDetails:Job Details not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Job Details not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnViewJobDetails:Job Details not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnViewJobDetails: error in getting Job Details :' + err);
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
                        console.log('FnViewJobDetails: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnViewJobDetails:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnViewJobDetails ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnJobNotification
 * Method : post
 * @param req
 * @param res
 * @param next
 * @description api code for Get Job Seekers Mail Details
 */
Job.prototype.jobNotification = function(req,res,next) {

    var fs = require("fs");
    var token = req.body.token;
    var ezeid = req.st.alterEzeoneId(req.body.ezeid);
    var ids = req.body.ids;    // tid of student ids
    var templateId = req.body.template_id;
    var jobId = req.body.job_id;
    var id;
    var i;
    var types='';
    var gid;
    var masterid='';
    var receiverId;
    var senderTitle;
    var groupTitle;
    var groupId;
    var messageText;
    var messageType;
    var operationType;
    var iphoneId;
    var messageId;

    //console.log(req.body);

    if (ids) {
        id = ids.split(",");
        //console.log(id.length);
        //console.log(id);
    }
    if(id.length) {
        for (var i = 0; i < id.length; i++) {
            types += 1 + ',';
        }
    }
    types = types.slice(0,-1);
    //console.log(types);


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if (!token) {
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if (!ezeid) {
        error['ezeid'] = 'Invalid ezeid';
        validateStatus *= false;
    }
    if (!ids) {
        error['ids'] = 'Invalid ids';
        validateStatus *= false;
    }
    if (!templateId) {
        error['templateId'] = 'Invalid templateId';
        validateStatus *= false;
    }

    if (!validateStatus) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var templateQuery = 'Select * from mmailtemplate where TID = ' + st.db.escape(templateId);
                        st.db.query(templateQuery, function (err, templateResult) {

                            if (!err) {
                                if (templateResult) {
                                    if (templateResult.length > 0) {
                                        if (templateResult[0]) {
                                            //console.log(templateResult[0].Body);

                                            var mailOptions = {
                                                html: templateResult[0].Body // html body
                                            };


                                            var queryParams1 = st.db.escape(ezeid) + ',' + st.db.escape(ids)+ ',' + st.db.escape(0);
                                            var query1 = 'CALL pSendMsgRequestbyPO(' + queryParams1 + ')';
                                            //console.log(query1);
                                            st.db.query(query1, function (err, getResult) {
                                                if (!err) {
                                                    if (getResult) {
                                                        //console.log(getResult);

                                                        var queryParams3 = st.db.escape(mailOptions.html) + ',' + st.db.escape('') + ',' + st.db.escape('')
                                                            + ',' + st.db.escape(1) + ',' + st.db.escape('') + ',' + st.db.escape('')
                                                            + ',' + st.db.escape(token) + ',' + st.db.escape(0) + ',' + st.db.escape(ids)
                                                            + ',' + st.db.escape(1) + ',' + st.db.escape('') + ',' + st.db.escape(0)+ ',' + st.db.escape(0);
                                                        var query3 = 'CALL pComposeMessage(' + queryParams3 + ')';
                                                        //console.log(query3);
                                                        st.db.query(query3, function (err, result) {
                                                            if (!err) {
                                                                if (result) {
                                                                    responseMessage.status = true;
                                                                    responseMessage.error = null;
                                                                    responseMessage.message = 'Notification send successfully';
                                                                    responseMessage.data = {
                                                                        token: req.body.token,
                                                                        ezeid: req.body.ezeid,
                                                                        ids: req.body.ids, //tid of student ids
                                                                        templateId: req.body.template_id,
                                                                        jobId: req.body.job_id,
                                                                        message: mailOptions.html
                                                                    };

                                                                    res.status(200).json(responseMessage);
                                                                    console.log('FnjobNotification:Message Composed successfully');
                                                                    for (var i = 0; i < id.length; i++) {
                                                                        gid = id[i];
                                                                        //console.log(gid);

                                                                        var query2 = 'select tid from tmgroups where GroupType=1 and adminID=' + gid;
                                                                        //console.log(query2);
                                                                        st.db.query(query2, function (err, getDetails) {
                                                                            if (getDetails) {
                                                                                if (getDetails[0]) {
                                                                                    receiverId = getDetails[0].tid;
                                                                                    senderTitle = ezeid;
                                                                                    groupTitle = ezeid;
                                                                                    groupId = gid;
                                                                                    messageText = mailOptions.html;
                                                                                    messageType = 1;
                                                                                    operationType = 0;
                                                                                    iphoneId = null;
                                                                                    messageId = 0;
                                                                                    masterid = '';
                                                                                    //console.log('senderid:' + groupId + '     receiverid:' + receiverId);
                                                                                    //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                                    notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);

                                                                                }
                                                                                else {
                                                                                    console.log('FnjobNotification:user details not loaded');
                                                                                }
                                                                            }
                                                                            else {
                                                                                console.log('FnjobNotification:user details not loaded');
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                                else {
                                                                    responseMessage.message = 'Notification not send';
                                                                    res.status(200).json(responseMessage);
                                                                    console.log('FnjobNotification:Error getting from composeMessage');

                                                                }
                                                            }
                                                            else {
                                                                responseMessage.error = {
                                                                    server: 'Internal Server Error'
                                                                };
                                                                responseMessage.message = 'An error occurred !';
                                                                res.status(500).json(responseMessage);
                                                                console.log('FnjobNotification:Error getting from composeMessage');

                                                            }
                                                        });
                                                    }
                                                    else {
                                                        responseMessage.message = 'Notification not send';
                                                        res.status(200).json(responseMessage);
                                                        console.log('FnjobNotification:Error getting from UserDaetils');

                                                    }
                                                }
                                                else {
                                                    responseMessage.error = {
                                                        server: 'Internal Server Error'
                                                    };
                                                    responseMessage.message = 'An error occurred !';
                                                    res.status(500).json(responseMessage);
                                                    console.log('FnjobNotification:Error getting from UserDaetils');

                                                }
                                            });
                                        }
                                        else {
                                            responseMessage.message = 'Notification not send';
                                            res.status(200).json(responseMessage);
                                            console.log('FnjobNotification:Error getting from templateResult');

                                        }
                                    }
                                    else {
                                        responseMessage.message = 'Notification not send';
                                        res.status(200).json(responseMessage);
                                        console.log('FnjobNotification:Error getting from templateResult');

                                    }
                                }
                                else {
                                    responseMessage.message = 'Notification not send';
                                    res.status(200).json(responseMessage);
                                    console.log('FnjobNotification:Error getting from templateResult');

                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('FnjobNotification:Error getting from templateResult');
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
                        console.log('FnjobNotification: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnjobNotification:Error in validating Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnJobNotification ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnFindInstitute
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for view job details
 */
Job.prototype.findInstitute = function(req,res,next){

    var token = req.query.token;
    var keywords = req.query.keywords;

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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams =  st.db.escape(keywords);
                        var query = 'CALL pFindInstitute(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if(getResult[0]){
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Institutes loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnSearchInstitute: Institutes loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Institutes not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnSearchInstitute:Institutes not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Institutes not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSearchInstitute:Institutes not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnSearchInstitute: error in getting institues :' + err);
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
                        console.log('FnSearchInstitute: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSearchInstitute:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnSearchInstitute ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnAddtoSelectedJob
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for add to selected job
 */
Job.prototype.addtoSelectedJob = function(req,res,next){


    var jobId = ((!isNaN(parseInt(req.params.jobId))) && (parseInt(req.params.jobId)) > 0) ? parseInt(req.params.jobId) : '';
    var isJson = req.is('json');
    var token;
    var cvId;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!jobId){
        error['jobId'] = 'Invalid jobId';
        validateStatus *= false;
    }

    if(!isJson){
        error['isJson'] = 'Invalid Input ContentType';
        validateStatus *= false;
    }
    else {
        cvId = parseInt(req.body.cv_id);

        if(req.body.token){
            token = req.body.token;
        }
        else{
            token = req.query.token;
        }

        if (!token) {
            error['token'] = 'token is Mandatory';
            validateStatus *= false;
        }
        if (isNaN(cvId)) {
            error['cv_id'] = 'Invalid cv id';
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
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(cvId)+ ',' + st.db.escape(jobId);
                        var query = 'CALL pAddcandtoselectedjob(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, jobResult) {
                            if (!err) {
                                if (jobResult) {
                                    if (jobResult[0]) {
                                        if (jobResult[0][0]) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Job Added successfully';
                                            responseMessage.data = jobResult[0][0];
                                            res.status(200).json(responseMessage);
                                            console.log('FnAddtoSelectedJob: Job Added successfully');
                                        }
                                        else {
                                            responseMessage.message = 'Job is not Added';
                                            res.status(200).json(responseMessage);
                                            console.log('FnAddtoSelectedJob:Job is not Added');
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'Job is not Added';
                                        res.status(200).json(responseMessage);
                                        console.log('FnAddtoSelectedJob:Job is not Added');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Job is not Added';
                                    res.status(200).json(responseMessage);
                                    console.log('FnAddtoSelectedJob:Job is not Added');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnAddtoSelectedJob: error in adding selected job :' + err);
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
                        console.log('FnAddtoSelectedJob: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnAddtoSelectedJob:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnAddtoSelectedJob ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnSaveJobLocation
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for jsave ob location
 */
Job.prototype.saveJobLocation = function(req,res,next){

    var token = req.body.token;
    var locationTitle = req.body.location_title;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var country = req.body.country;
    var maptype = req.body.maptype;

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
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(locationTitle) + ',' + st.db.escape(latitude)+ ',' + st.db.escape(longitude)
                            + ',' + st.db.escape(country)+ ',' + st.db.escape(maptype);
                        var query = 'CALL psavejoblocation(' + queryParams + ')';
                        st.db.query(query, function (err, insertResult) {
                            if (!err) {
                                if (insertResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Job Location saved successfully';
                                    responseMessage.data = {
                                        locationTitle : req.body.location_title,
                                        latitude : req.body.latitude,
                                        longitude : req.body.longitude,
                                        country : req.body.country,
                                        maptype : req.body.maptype
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveJobLoaction: Job Location saved successfully');
                                }
                                else {
                                    responseMessage.message = 'Job Location not saved';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveJobLoaction:Job Location not saved');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnSaveJobLoaction: error in saving JobLocation  :' + err);
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
                        console.log('FnSaveJobLoaction: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveJobLoaction:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnSaveJobLoaction ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetCandidatesList
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get loc
 */
Job.prototype.getCandidatesList = function(req,res,next){

    var token = req.query.token;

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

            var queryParams = st.db.escape(token);
            var query = 'CALL pgetlistofcanPO(' + queryParams + ')';
            //console.log(query);
            st.db.query(query, function (err, candidatesList) {
                if (!err) {
                    if (candidatesList) {
                        if (candidatesList[0]) {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Candidates List loaded sucessfully';
                            responseMessage.data = candidatesList[0];
                            res.status(200).json(responseMessage);
                            console.log('FnGetCandidatesList: Candidates List loaded sucessfully');
                        }
                        else {
                            responseMessage.message = 'Candidates List is not loaded';
                            res.status(200).json(responseMessage);
                            console.log('FnGetCandidatesList:Candidates List is not loaded');
                        }
                    }
                    else {
                        responseMessage.message = 'Candidates List is not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnGetCandidatesList:Candidates List is not loaded');
                    }
                }
                else {
                    responseMessage.message = 'An error occured ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnGetCandidatesList: error in getting Candidates List :' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetCandidatesList ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnUpdateCandidateStatus
 * Method : post
 * @param req
 * @param res
 * @param next
 * @description api code for update candidate status
 */
Job.prototype.updateCandidateStatus = function(req,res,next){

    /* input parameters
     * cvid <int>
     * salary <DECIMAL(4,2)>
     * jt <VARCHAR(150)>  // job title
     * st <int> // status
     * n <varchar(250)>  // notes
     */
    // checking input parameters are json or not
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
    else {
        if (!req.body.token) {
            error['token'] = 'Invalid token';
            validateStatus *= false;
        }
    }


    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(req.body.cv_id) + ','  + st.db.escape(req.body.salary)
                            + ','  + st.db.escape(req.body.jt) + ','  + st.db.escape(req.body.st)+ ','  + st.db.escape(req.body.n);

                        var query = 'CALL pupdatecandidateinterviewstatus(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, statusResult) {
                            if (!err) {
                                if (statusResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Status Updated successfully';
                                    responseMessage.data = {
                                        cv_id : req.body.cv_id,
                                        salary : req.body.salary,
                                        jt : req.body.jt,
                                        st : req.body.st,
                                        n : req.body.n
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateCandidateStatus: Status Updated  successfully');
                                }
                                else {
                                    responseMessage.message = 'Status not updated';
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateCandidateStatus:Status not updated');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnUpdateCandidateStatus: error in updating status:' + err);
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
                        console.log('FnUpdateCandidateStatus: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnUpdateCandidateStatus:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnUpdateCandidateStatus ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnAutoSearchJobs
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for auto search jobs
 */
Job.prototype.autoSearchJobs = function(req,res,next){

    var token = req.query.token;
    var title = req.query.title;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'token is a mandatory';
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
                        var queryParams =  st.db.escape(title);
                        var query = 'CALL pfindjobs(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, searchResult) {
                            if (!err) {
                                if (searchResult) {
                                    if(searchResult[0]){
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Search jobs loaded successfully';
                                        responseMessage.data = searchResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnAutoSearchJobs: Search jobs loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Search jobs not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnAutoSearchJobs:Search jobs not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Search jobs not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnAutoSearchJobs:Search jobs not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnAutoSearchJobs: error in getting Search jobs :' + err);
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
                        console.log('FnAutoSearchJobs: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnAutoSearchJobs:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnAutoSearchJobs ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnApplicantStatus
 * Method : post
 * @param req
 * @param res
 * @param next
 * @description api code for update candidate status
 */
Job.prototype.applicantStatus = function(req,res,next){

    /* input parameters
     * cvid <int>
     * token <char(36)>
     * st <int> // status   1-show else hide
     */

    // checking input parameters are json or not
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
    else {
        if (!req.body.token) {
            error['token'] = 'Invalid token';
            validateStatus *= false;
        }
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(req.body.token) + ','  + st.db.escape(req.body.cv_id)
                            + ','  + st.db.escape(req.body.st);

                        var query = 'CALL phideorshowApplicant(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, statusResult) {
                            if (!err) {
                                if (statusResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Status Updated successfully';
                                    responseMessage.data = {
                                        cv_id : req.body.cv_id,
                                        st : req.body.st
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnApplicantStatus: Status Updated  successfully');
                                }
                                else {
                                    responseMessage.message = 'Status not updated';
                                    res.status(200).json(responseMessage);
                                    console.log('FnApplicantStatus:Status not updated');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnApplicantStatus: error in updating status:' + err);
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
                        console.log('FnApplicantStatus: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnApplicantStatus:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnApplicantStatus ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * Link multiple candidates to multiple jobs at once
 * Used in jobseeker module of front end
 * Where we can search for any candidate and
 *
 * @method POST
 * @service-param candidate_list
 * @service-param job_list
 * @api /jobs_to_applicants
 */
Job.prototype.assignJobsToApplicants = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    if(req.is('json')){
        var validationFlag = true;

        var error = {};


        if(!util.isArray(req.body.candidate_list)){
            validationFlag *= false;
            error['candidate_list'] = "Candidate list is empty or not present";
        }

        if(validationFlag){
            if(req.body.candidate_list.length < 1){
                validationFlag *= false;
                error['candidate_list'] = "Candidate list is empty or not present";
            }
        }

        if(!util.isArray(req.body.job_list)){
            validationFlag *= false;
            error['job_list'] = "Job list is empty or not present";
        }

        if(validationFlag){
            if(req.body.job_list.length < 1){
                validationFlag *= false;
                error['job_list'] = "Job list is empty or not present";
            }
        }

        if(!validationFlag){
            responseMessage.error = error;
            responseMessage.message = 'Please check the errors';
            res.status(400).json(responseMessage);
            console.log(responseMessage);
        }
        else {
            try {
                st.validateToken(req.body.token, function (err, tokenResult) {
                    if (!err) {
                        if (tokenResult) {

                            var combinedQuery = "";
                            console.log(req.body.candidate_list);
                            console.log(req.body.job_list);

                            for(var i = 0; i < req.body.candidate_list.length; i++){
                                /**
                                 * Adding validation for every cvid passed (Candidate list consists of cvIds)
                                 */
                                if(!isNaN(parseInt(req.body.candidate_list[i]))){
                                    for(var j = 0; j < req.body.job_list.length; j++){
                                        /**
                                         * Adding validation for every jobId passed (Job list consists of jobIds)
                                         */
                                        if(!isNaN(parseInt(req.body.job_list[j]))){
                                            var queryParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.candidate_list[i])+
                                                ',' + st.db.escape(req.body.job_list[j]);
                                            var addQuery = "CALL pAddcandtoselectedjob(" + queryParams + ");";
                                            combinedQuery += addQuery;
                                            console.log(addQuery);
                                        }
                                    }
                                }
                            }
                            console.log('combinedQuery',combinedQuery);
                            st.db.query(combinedQuery, function (err, jobResult) {
                                if (!err) {
                                    console.log(jobResult);
                                    if (jobResult) {
                                        if (jobResult.length > 1) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Jobs Added successfully to candidates';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                        else{
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Jobs Added successfully to candidates';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else{
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Problem adding jobs to candidates';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else{
                                    responseMessage.error = {
                                        server: 'Internal Server Error'
                                    };
                                    responseMessage.message = 'An error occurred !';
                                    res.status(500).json(responseMessage);
                                    console.log('Error : assignJobsToApplicants ',err);
                                    var errorDate = new Date();
                                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                                }
                            });
                        }
                        else{
                            responseMessage.message = 'Invalid token';
                            responseMessage.error = {
                                token: 'invalid token'
                            };
                            responseMessage.data = null;
                            res.status(401).json(responseMessage);
                            console.log('FnGetListOfJobs: Invalid token');
                        }
                    }
                    else{
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'An error occurred !';
                        res.status(500).json(responseMessage);
                        console.log('Error : assignJobsToApplicants ',err);
                        var errorDate = new Date();
                        console.log(errorDate.toTimeString() + ' ......... error ...........');
                    }
                });
            }
            catch(ex) {
                responseMessage.error = {
                    server: 'Internal Server Error'
                };
                responseMessage.message = 'An error occurred !';
                res.status(500).json(responseMessage);
                console.log('Error assignJobsToApplicants :  ',ex);
                var errorDate = new Date();
                console.log(errorDate.toTimeString() + ' ......... error ...........');
            }
        }

    }
    else{
        responseMessage.error = "Accepted content type is json only";
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * Changes status of the job for placement officer (Placement officer will call this API)
 * and notifies to the employer(Company who posted the job) about the status that job that placement officer
 * has accepted, rejected etc.
 *
 *
 * This status is different than job status
 * it is the status of job in respect to placement officer (institute) [In few procedures it is marked as pJobStatus]
 */
Job.prototype.activateJobPO = function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!req.body.token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!req.body.jobid){
        error['jobid'] = 'Invalid job tids';
        validateStatus *= false;
    }
    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            var jobTypeList =  [
                "Full Time",
                "Part Time",
                "Work from Home",
                "Internship",
                "Apprenticeship",
                "Job Oriented Training",
                "Freelancer"
            ];
            req.body.st = (req.body.st) ? req.body.st : 0;
            st.validateToken(req.body.token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(req.body.token)+','+st.db.escape(req.body.jobid)+','+st.db.escape(req.body.st);
                        var query = 'CALL pActivatejobPO(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, jobResult) {
                            if (!err) {
                                if (jobResult){
                                    console.log(jobResult);
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Job status updated successfully';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                    var userId = [];
                                    var emailArray = [];
                                    var combineQuery = "";
                                    var combinePOquery = "";
                                    /**
                                     * for recruitment function type is 4
                                     * @type {number}
                                     */
                                    var functionType = 4;
                                    var queryPOparams = st.db.escape(jobResult[1][0].ezeid) + ',' + st.db.escape(functionType);
                                    combinePOquery = 'CALL get_subuser_list(' + queryPOparams + ')';
                                    st.db.query(combinePOquery, function (err, notDetailsRes) {
                                        console.log(combinePOquery);
                                        if (notDetailsRes && notDetailsRes[0] && false) {
                                            //console.log(notDetailsRes);
                                            for (var count = 0; count < notDetailsRes[0].length; count++) {
                                                if (notDetailsRes[0][count].userRights){
                                                    if ((!isNaN(parseInt(notDetailsRes[0][count].userRights.split('')[4]))) &&
                                                        parseInt(notDetailsRes[0][count].userRights.split('')[4]) > 0 ){
                                                        console.log("comming to this block");
                                                        var receiverId = notDetailsRes[0][count].receiverId;
                                                        var senderTitle = '';
                                                        var groupTitle = notDetailsRes[0][count].groupTitle;
                                                        var groupId = notDetailsRes[0][count].groupId;
                                                        var messageText = 'Placement officer has activated job';
                                                        /**
                                                         * messageType 25 when placement officer will change status of any job
                                                         */
                                                        var messageType = 25;
                                                        var operationType = 0;
                                                        var iphoneId = notDetailsRes[0][count].iphoneId;
                                                        var messageId = 0;
                                                        var masterid = notDetailsRes[0][count].masterid;
                                                        var latitude = 0.00, longitude = 0.00, prioritys = 1, dateTime = '';
                                                        var msgUserid = 0, a_name = '';

                                                        var jid = req.body.jobid;
                                                        console.log(receiverId, senderTitle, groupTitle, groupId, messageText,
                                                            messageType, operationType, iphoneId, messageId, masterid);
                                                        /**
                                                         * Send notification to when any job will be posted placement officer of verified
                                                         * institute will get notification
                                                         */
                                                        notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText,
                                                            messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys,
                                                            dateTime, a_name, msgUserid, jid);
                                                        console.log("Notification Send");
                                                        /**
                                                         * Send mail to company when placement officer will accept job
                                                         */
                                                        /**
                                                         * @todo add template functionality is added
                                                         */
                                                    }
                                                }
                                            }
                                        }

                                        /////////////////////////////////////// New Code /////////////////////////////////////

                                        else if(notDetailsRes && notDetailsRes[0]){
                                            var mailTpl = 'placement_officer_unverified_job_alert';
                                            var pOnotificationTpl = 'placement_officer_unverified_job_alert';

                                            /**
                                             * Finding if the placement officer is the masterId or he is a subuser
                                             * If he is a master then we will send him mail even if he has not
                                             * enabled the recruitment module in his user section of settings(configuration)
                                             */
                                            var isMaster = notDetailsRes[counter][counter1].groupTitle ?
                                                (notDetailsRes[counter][counter1].groupTitle.split('.').length <= 1) : false;


                                            if(notDetailsRes[counter][counter1].isVerified){

                                                console.log('\n Verified ID ',notDetailsRes[counter][counter1].groupId);
                                                /**
                                                 * These colleges are verified so send them a notification and mail to this placement officer
                                                 * to change the status of this job
                                                 *
                                                 */
                                                mailTpl = 'placement_officer_job_approval';
                                                pOnotificationTpl = 'placement_officer_job_approval';


                                            }

                                            chalk.green('notDetailsRes[counter][counter1].groupId',notDetailsRes[counter][counter1].groupId);

                                            if(isMaster){
                                                if(notDetailsRes[counter][counter1].CVMailID){
                                                    mailerApi.sendMailNew(mailTpl,{
                                                        jobType : jobTypeList[jobType],
                                                        jobTitle : jobTitle,
                                                        jobCode : jobCode,
                                                        companyName : notificationResult[1][0].cn,
                                                        keySkills : (keySkills) ? keySkills : '',
                                                        jobId : jobID
                                                    },"New job posted for your institute",notDetailsRes[counter][counter1].CVMailID);
                                                }

                                                if(notDetailsRes[counter][counter1].AdminEmailID){
                                                    mailerApi.sendMailNew(mailTpl,{
                                                        jobType : jobTypeList[jobType],
                                                        jobTitle : jobTitle,
                                                        jobCode : jobCode,
                                                        companyName : notificationResult[1][0].cn,
                                                        keySkills : (keySkills) ? keySkills : '',
                                                        jobId : jobID
                                                    },"New job posted for your institute",notDetailsRes[counter][counter1].AdminEmailID);
                                                }

                                                notificationTemplaterRes = notificationTemplater.parse(pOnotificationTpl,{
                                                    jobType : jobTypeList[jobType],
                                                    jobTitle : jobTitle,
                                                    jobCode : jobCode,
                                                    companyName : notificationResult[1][0].cn // Who posted the job
                                                });


                                                if(notificationTemplaterRes.parsedTpl){
                                                    notification.publish(
                                                        notDetailsRes[counter][counter1].groupId,
                                                        ezeoneId,
                                                        ezeoneId,
                                                        notDetailsRes[counter][counter1].groupId,
                                                        notificationTemplaterRes.parsedTpl,
                                                        8,
                                                        0, notDetailsRes[counter][counter1].iphoneId,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        1,
                                                        moment().format("YYYY-MM-DD HH:mm:ss"),
                                                        '',
                                                        0,
                                                        jobID);
                                                    console.log('postNotification : Job notification for Placement Officer is sent successfully');
                                                }
                                                else{
                                                    console.log('Error in parsing notification '+notificationTpl+' template - ',
                                                        notificationTemplaterRes.error);
                                                    console.log('postNotification : Job notification for Placement Officer is not sent');
                                                }

                                            }



                                            /**
                                             * If the placement officer is a subuser and is not master then we will check
                                             * his user module rights to see whether he is having right to access user module or not
                                             * If yes then only we will send him the mail and notification
                                             */
                                            else if(notDetailsRes[counter][counter1].userRights &&
                                                notDetailsRes[counter][counter1].userRights.length == 5 &&
                                                parseInt(notDetailsRes[counter][counter1].userRights[4]) > 0){



                                                console.log('Coming to else if block00');

                                                if(notDetailsRes[counter][counter1].CVMailID){
                                                    mailerApi.sendMailNew(mailTpl,{
                                                        jobType : jobTypeList[jobType],
                                                        jobTitle : jobTitle,
                                                        jobCode : jobCode,
                                                        companyName : notificationResult[1][0].cn,
                                                        keySkills : (keySkills) ? keySkills : '',
                                                        jobId : jobID
                                                    },"New job posted for your institute",notDetailsRes[counter][counter1].CVMailID);
                                                }

                                                if(notDetailsRes[counter][counter1].AdminEmailID){
                                                    mailerApi.sendMailNew(mailTpl,{
                                                        jobType : jobTypeList[jobType],
                                                        jobTitle : jobTitle,
                                                        jobCode : jobCode,
                                                        companyName : notificationResult[1][0].cn,
                                                        keySkills : (keySkills) ? keySkills : '',
                                                        jobId : jobID
                                                    },"New job posted for your institute",notDetailsRes[counter][counter1].AdminEmailID);
                                                }


                                                var notificationTemplaterRes = notificationTemplater.parse(pOnotificationTpl,{
                                                    jobType : jobTypeList[jobType],
                                                    jobTitle : jobTitle,
                                                    jobCode : jobCode,
                                                    companyName : notificationResult[1][0].cn // Who posted the job
                                                });

                                                if(notificationTemplaterRes.parsedTpl){
                                                    notification.publish(
                                                        notDetailsRes[counter][counter1].groupId,
                                                        ezeoneId,
                                                        ezeoneId,
                                                        notDetailsRes[counter][counter1].groupId,
                                                        notificationTemplaterRes.parsedTpl,
                                                        8,
                                                        0, notDetailsRes[counter][counter1].iphoneId,
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        1,
                                                        moment().format("YYYY-MM-DD HH:mm:ss"),
                                                        '',
                                                        0,
                                                        jobID);
                                                    console.log('postNotification : Job notification for Placement Officer is sent successfully');
                                                }
                                                else{
                                                    console.log('Error in parsing notification '+notificationTpl+' template - ',
                                                        notificationTemplaterRes.error);
                                                    console.log('postNotification : Job notification for Placement Officer is not sent');
                                                }

                                            }

                                        }

                                        /////////////////////////////////////// New Code Ends here /////////////////////////////////////
                                        else {
                                            console.log('get_subuser_enquiry:user details not loaded');
                                        }
                                    });

                                    if (parseInt(req.body.st) == 1){
                                        userId = (jobResult[0][0].ids) ? jobResult[0][0].ids.split(',') : '';
                                        emailArray = (jobResult[0][0].emailids) ? jobResult[0][0].emailids.split(',') : '';
                                        console.log(userId);
                                        /**
                                         * send mail to students of verified institute after job acceted by placment officer
                                         */
                                        for (var e = 0; e < emailArray.length; e++){
                                            mailerApi.sendMail('job_post_template', {
                                                userName : 'abc',
                                                JobType : jobTypeList[jobResult[1][0].JobType],
                                                JobTitle : jobResult[1][0].JobTitle,
                                                JobCode : req.body.jobid,
                                                CompanyName : jobResult[1][0].CompanyName
                                            }, '', emailArray[e]);
                                        }
                                        var path = require('path');
                                        for (var k = 0; k < userId.length; k++) {
                                            var gidQuery = 'select tid from tmgroups where GroupType=1 and adminID=' + userId[k];
                                            var iosIdQuery = 'select EZEID,IPhoneDeviceID as iphoneID, FirstName as fn from tmaster where tid=' + userId[k];
                                            var file = path.join(__dirname, '../../mail/templates/job_post.html');
                                            var data = fs.readFileSync(file, "utf8");
                                            data = data.replace("[JobType]", 'jobTypeList[jobType]');
                                            data = data.replace("[JobTitle]", 'jobTitle');
                                            data = data.replace("[JobCode]", req.body.jobid);
                                            data = data.replace("[CompanyName]", 'notificationResult[1][0].cn');

                                            combineQuery +=  gidQuery + ';' + iosIdQuery + ';';
                                            console.log(combineQuery);
                                        }
                                        st.db.query(combineQuery, function (err, messageResult) {
                                            if (!err) {
                                                if (messageResult) {
                                                    console.log('messageResult',messageResult);
                                                    for( var j = 0; j < userId.length; j++){
                                                        var receiverId = messageResult[j*2][0].tid;
                                                        var senderTitle = '';
                                                        var groupTitle = '';
                                                        var groupId = messageResult[j*2][0].tid;
                                                        var messageText = data;
                                                        /**
                                                         * messageType 26 when placement officer will activate any job all student of
                                                         * that institute will get notification
                                                         * @type {number}
                                                         */
                                                        var messageType = 26;
                                                        var operationType = 0;
                                                        var iphoneId = (messageResult[j*2+1][0].iphoneID) ? messageResult[j*2+1][0].iphoneID : null ;
                                                        var messageId = 0, masterid = 0, latitude = 0.00, longitude = 0.00, prioritys = 1, dateTime = '';
                                                        var msgUserid = 0, a_name = '';
                                                        var jid = req.body.jobid;
                                                        console.log(receiverId, senderTitle, groupTitle, groupId, messageText,
                                                            messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys,
                                                            dateTime, a_name, msgUserid, jid);
                                                        notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText,
                                                            messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys,
                                                            dateTime, a_name, msgUserid, jid);
                                                        console.log('Job Post Notification Send Successfully');
                                                    }
                                                    console.log('postNotification : Job Post Notification Send Successfully');
                                                }
                                                else {
                                                    console.log('postNotification : Error in sending notifications');
                                                }
                                            }
                                            else {
                                                console.log('postNotification : Error in sending notifications');
                                            }
                                        });
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error while updating job status';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('activateJobPO: Error in update job status:' + err);
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
                        console.log('activateJobPO: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('activateJobPO:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : activateJobPO ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for get notify Relevant Student
 * @param token <string> token of login user
 * @param ezeoneId <string> ezeone id of company who want to send notifications
 * @param job_id <int> job id
 */
Job.prototype.notifyRelevantJobSeekers = function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var receiverId;
    var senderTitle;
    var groupTitle;
    var groupId;
    var messageText;
    var messageType;
    var operationType;
    var iphoneId;
    var userId = [];
    var iphoneID='';

    var validateStatus = true;
    var error = {};

    if(!req.body.token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!req.body.ezeoneId){
        error['ezeoneId'] = 'Invalid EZEone Id';
        validateStatus *= false;
    }
    if (isNaN(parseInt(req.body.job_id))){
        error['job_id'] = 'Invalid job id';
        validateStatus *= false;
    }
    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            var jobID = req.body.job_id;
            var token = req.body.token;
            var ezeoneId = req.body.ezeoneId;
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(jobID) + ',' + st.db.escape(token);
                        var query = 'CALL PNotifyRelevantStudent(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, notificationResult) {
                            if (!err) {
                                console.log(notificationResult);
                                if (notificationResult) {
                                    if (notificationResult[0]) {
                                        //send push notification
                                        console.log('job post notification...');
                                        for (var i = 0; i < notificationResult[0].length; i++) {
                                            userId = notificationResult[0][i].ids.split(',');
                                        }
                                        var mIds = ' ';
                                        for (var c = 0; c < notificationResult[0].length; c++) {
                                            var mIds = notificationResult[0][c].ids + ',' + mIds;
                                        }
                                        var jobqueryParameters = st.db.escape(mIds) + ',' + st.db.escape(jobID);

                                        var jobQuery = 'CALL psavejobnotification(' + jobqueryParameters + ')';
                                        console.log(jobQuery);
                                        st.db.query(jobQuery, function (err, queryResult) {
                                            console.log(queryResult);
                                            if (!err) {
                                                console.log('no error in psavejobnotification');
                                            }
                                            else {
                                                console.log('error in psavejobnotification');
                                            }
                                        });
                                        console.log(userId);
                                        var combineQuery = "";
                                        for (var k = 0; k < userId.length; k++) {
                                            var gidQuery = 'select tid from tmgroups where GroupType=1 and adminID=' + userId[k];
                                            var iosIdQuery = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid=' + userId[k];
                                            var sendMsgParams = st.db.escape(ezeoneId) + ',' + st.db.escape(userId[k]) + ',' + st.db.escape(0);

                                            /**
                                             * Make connection of student(contact connected in messagebox) with this College ID
                                             * which is sending the notification (so that  it will appear in student contact list)
                                             */
                                            var path = require('path');
                                            var file = path.join(__dirname, '../../mail/templates/job_post.html');
                                            var data = fs.readFileSync(file, "utf8");

                                            data = data.replace("[JobType]", notificationResult[1][0].jobtype);
                                            data = data.replace("[JobTitle]", notificationResult[1][0].jobTitle);
                                            data = data.replace("[JobCode]", notificationResult[1][0].jobCode);
                                            data = data.replace("[CompanyName]", notificationResult[1][0].cn);
                                            var composeMsgParams = st.db.escape(data) + ',' + st.db.escape('') + ',' + st.db.escape('')
                                                + ',' + st.db.escape(1) + ',' + st.db.escape('') + ',' + st.db.escape('')
                                                + ',' + st.db.escape(token) + ',' + st.db.escape(0) + ',' + st.db.escape(userId[k])
                                                + ',' + st.db.escape(1) + ',' + st.db.escape('') + ',' + st.db.escape(0) + ',' + st.db.escape(0);

                                            combineQuery += 'CALL pSendMsgRequestbyPO(' + sendMsgParams + ');' +
                                                'CALL pComposeMessage(' + composeMsgParams + '); '
                                                + gidQuery + ' ;'
                                                + iosIdQuery + ';'
                                            console.log(combineQuery);

                                        }
                                            st.db.query(combineQuery, function (err, messageResult) {
                                                if (!err) {
                                                    if (messageResult) {
                                                        console.log(messageResult);
                                                        for( var j = 0; j < userId.length; j++){
                                                            receiverId = messageResult[j*(5)+3][0].tid;
                                                            senderTitle = ezeoneId;
                                                            groupTitle = ezeoneId;
                                                            groupId = notificationResult[1][0].tid;
                                                            messageText = data;
                                                            messageType = 8;
                                                            operationType = 0;
                                                            iphoneId = iphoneID; //messageResult[j*(5)+4][0]) ? messageResult[j*(5)+4][0] : null ;
                                                            var messageId = 0, masterid = 0, latitude = 0.00, longitude = 0.00, prioritys = 1, dateTime = '';
                                                            var msgUserid = 0, a_name = '';
                                                            var jid = jobID;
                                                            console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType,
                                                                operationType, iphoneId, messageId, masterid);
                                                            notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText,
                                                                messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys, dateTime, a_name, msgUserid, jid);
                                                            console.log('Job Post Notification Send Successfully');

                                                        }
                                                        responseMessage.status = true;
                                                        responseMessage.error = null;
                                                        responseMessage.data = null;
                                                        responseMessage.message = 'Job Post Notification Send Successfully';
                                                        res.status(200).json(responseMessage);

                                                    }
                                                    else {
                                                        responseMessage.status = false;
                                                        responseMessage.error = null;
                                                        responseMessage.data = null;
                                                        responseMessage.message = 'Error in sending notifications';
                                                        res.status(200).json(responseMessage);
                                                    }
                                                }
                                                else {
                                                    responseMessage.status = false;
                                                    responseMessage.error = null;
                                                    responseMessage.data = null;
                                                    responseMessage.message = 'Error in sending notifications';
                                                    res.status(200).json(responseMessage);
                                                }
                                            });
                                    }
                                    else {
                                        responseMessage.message = 'Result not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnNotifyRelevantStudent:Result not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'Result not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnNotifyRelevantStudent:Result not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnNotifyRelevantStudent: error :' + err);
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
                        console.log('FnNotifyRelevantStudent: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnNotifyRelevantStudent:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnNotifyRelevantStudent ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


module.exports = Job;
