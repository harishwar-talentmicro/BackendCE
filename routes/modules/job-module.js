/**
 *  @author Gowri shankar
 *  @since July 22,2015  03:42PM
 *  @title Job module
 *  @description Handles Job functions
 */
"use strict";

var async = require('async');

var path ='D:\\EZEIDBanner\\';
var EZEIDEmail = 'noreply@ezeone.com';

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


var Notification = require('./notification/notification-master.js');
var NotificationQueryManager = require('./notification/notification-query.js');
var notification = null;
var notificationQmManager = null;


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
    var _this = this;
    var fs = require("fs");

    console.log('save jobs...');

    var token = req.body.token;
    var tid = req.body.tid;
    var ezeone_id = alterEzeoneId(req.body.ezeone_id);
    var job_code = req.body.job_code;
    var job_title = req.body.job_title;
    var exp_from = req.body.exp_from ? req.body.exp_from : 0;
    var exp_to = req.body.exp_to ? req.body.exp_to : 0;
    var job_description = req.body.job_description;
    var salaryFrom = req.body.salaryFrom;
    var salaryTo = req.body.salaryTo;
    var salaryType = req.body.salaryType;
    var keySkills = req.body.keySkills ? req.body.keySkills : '';
    var openings = req.body.openings;
    var jobType = req.body.jobType;
    var status = req.body.status;
    var contactName = req.body.contactName;
    var email_id =req.body.email_id ? req.body.email_id : '';
    var mobileNo =req.body.mobileNo ? req.body.mobileNo : '';
    var locationsList = req.body.locationsList;
    var categoryID = req.body.category_id;

    var instituteIdStr = (req.body.institute_id) ? req.body.institute_id : '';

    if(typeof(locationsList) == "string") {
        locationsList = JSON.parse(locationsList);
    }
    var location_id = '',count;
    var resultvalue = '';
    var skillMatrix1 = req.body.skillMatrix;
    skillMatrix1= JSON.parse(JSON.stringify(skillMatrix1));
    if (!skillMatrix1){
        skillMatrix1=[];
    }

    var jobID,m= 0,jobtype,masterid='',gid,receiverId,toid=[],senderTitle,groupTitle,groupId,messageText;
    var messageType,operationType,iphoneId,messageId,userID;

    var cid = req.body.cid ? parseInt(req.body.cid) : 0;   // client id
    var conatctId = req.body.ctid ? parseInt(req.body.ctid) : 0;     // contact id
    var isconfidential = req.body.isconfi ? parseInt(req.body.isconfi) : 0;
    var alumnicode = req.body.acode;    // alumni code
    var locMatrix = req.body.locMatrix;
    locMatrix= JSON.parse(JSON.stringify(locMatrix));
    var educations = req.body.jobEducation;
    educations= JSON.parse(JSON.stringify(educations));
    var iphoneID='';


    if (jobType == 0){
        jobtype = 'Full Time';
    }
    else if (jobType == 1){
        jobtype = 'Part Time';
    }
    else if (jobType == 2){
        jobtype = 'Work from Home';
    }
    else if (jobType == 3){
        jobtype = 'Internship';
    }
    else if (jobType == 4){
        jobtype = 'Apprenticeship';
    }
    else if (jobType == 5){
        jobtype = 'Job Oriented Training';
    }
    else if (jobType == 6){
        jobtype = 'Consultant';
    }
    else if (jobType == 7){
        jobtype = 'Freelancer';
    }

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var error = {},validateStatus = true;
    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!tid){
        tid = 0;
    }
    if(parseInt(tid) == NaN){
        error['tid'] = 'Invalid tid';
        validateStatus *= false;
    }
    if(!ezeone_id){
        error['ezeone_id'] = 'Invalid ezeone_id';
        validateStatus *= false;
    }
    if(!job_code){
        error['job_code'] = 'Invalid job_code';
        validateStatus *= false;
    }
    if(!job_title){
        error['job_title'] = 'Invalid job_title';
        validateStatus *= false;
    }
    if(!job_description){
        error['job_description'] = 'Invalid job_description';
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
    if(parseInt(jobType) == NaN){
        error['jobType'] = 'Invalid jobType';
        validateStatus *= false;
    }

    if(parseInt(status) == NaN){
        error['status'] = 'Invalid status';
        validateStatus *= false;
    }
    if(!locationsList){
        locationsList = [];
    }
    if(parseInt(cid) == NaN){
        error['cid'] = 'Invalid client id';
        validateStatus *= false;
    }
    if(parseInt(conatctId) == NaN){
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
                            var query = st.db.escape(tid) + ',' + st.db.escape(ezeone_id) + ',' + st.db.escape(job_code)
                                + ',' + st.db.escape(job_title) + ',' + st.db.escape(exp_from) + ',' + st.db.escape(exp_to)
                                + ',' + st.db.escape(job_description) + ',' + st.db.escape(salaryFrom) + ',' + st.db.escape(salaryTo)
                                + ',' + st.db.escape(salaryType) + ',' + st.db.escape(keySkills) + ',' + st.db.escape(openings)
                                + ',' + st.db.escape(jobType) + ',' + st.db.escape(status) + ',' + st.db.escape(contactName)
                                + ',' + st.db.escape(email_id) + ',' + st.db.escape(mobileNo) + ',' + st.db.escape(location_id) + ','  +st.db.escape(instituteIdStr)
                                + ',' + st.db.escape(cid)+ ',' + st.db.escape(conatctId)
                                + ',' + st.db.escape(isconfidential) + ',' + st.db.escape(alumnicode);
                            console.log('CALL pSaveJobs(' + query + ')');
                            st.db.query('CALL pSaveJobs(' + query + ')', function (err, insertresult) {
                                if (!err) {
                                    if (insertresult) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Jobs save successfully';
                                        responseMessage.data = {
                                            token: token,
                                            tid: tid,
                                            ezeone_id: ezeone_id,
                                            job_code: job_code,
                                            job_title: job_title,
                                            exp_from: exp_from,
                                            exp_to: exp_to,
                                            job_description: job_description,
                                            salaryFrom: salaryFrom,
                                            salaryTo: salaryTo,
                                            salaryType: salaryType,
                                            keySkills: keySkills,
                                            openings: openings,
                                            jobType: jobType,
                                            status: status,
                                            contactName: contactName,
                                            email_id: email_id,
                                            mobileNo: mobileNo,
                                            location_id: location_id,
                                            categoryID: categoryID,
                                            cid : cid,
                                            ctid : conatctId,
                                            isconfi : isconfidential,
                                            acode : alumnicode
                                        };
                                        res.status(200).json(responseMessage);

                                        if(locMatrix.length) {

                                            async.each(locMatrix, function iterator(locDetails, callback) {

                                                count = count - 1;

                                                var locSkills = {
                                                    expertiseLevel: locDetails.expertiseLevel,
                                                    jobid: insertresult[0][0].jobid,
                                                    expFrom: locDetails.exp_from,
                                                    expTo: locDetails.exp_to,
                                                    fid: locDetails.fid,
                                                    careerId: locDetails.career_id
                                                };

                                                var queryParams = st.db.escape(locSkills.jobid) + ',' + st.db.escape(locSkills.fid)
                                                    + ',' + st.db.escape(locSkills.expFrom) + ',' + st.db.escape(locSkills.expTo)
                                                    + ',' + st.db.escape(locSkills.expertiseLevel) + ',' + st.db.escape(locSkills.careerId);

                                                var query = 'CALL pSaveJobLOC(' + queryParams + ')';
                                                console.log(query);
                                                st.db.query(query, function (err, result) {
                                                    if (!err) {
                                                        if (result) {
                                                            if (result.affectedRows > 0) {
                                                                console.log('FnupdateSkill: locMatrix: skill matrix Updated successfully');
                                                            }
                                                            else {
                                                                console.log('FnupdateSkill: locMatrix: skill matrix not updated');
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnupdateSkill: locMatrix: skill matrix not updated')
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnupdateSkill: locMatrix ; error in saving  skill matrix:' + err);
                                                    }
                                                });
                                            });
                                        }
                                        else
                                        {
                                            locMatrix='';
                                        }

                                        if(educations.length) {
                                            async.each(educations, function iterator(eduDetails,callback) {

                                                count = count -1;

                                                var educationData = {

                                                    jobid: insertresult[0][0].jobid,
                                                    eduId :eduDetails.edu_id,
                                                    spcId : eduDetails.spc_id,
                                                    scoreFrom:eduDetails.score_from,
                                                    scoreTo:eduDetails.score_to,
                                                    level : eduDetails.expertiseLevel,   // 0-ug, 1-pg
                                                    instituteId : eduDetails.institute_id
                                                };



                                                //var queryParams = st.db.escape(educationData.jobid) + ',' +st.db.escape(educationData.eduId)
                                                //    + ',' +st.db.escape(educationData.spcId) + ',' +st.db.escape(educationData.scoreFrom)
                                                //    + ',' +st.db.escape(educationData.scoreTo)+ ',' +st.db.escape(educationData.level)
                                                //    + ',' +st.db.escape(educationData.instituteId);


                                                var queryParams = st.db.escape(educationData.jobid) + ',' +st.db.escape(educationData.eduId)
                                                    + ',' +st.db.escape(educationData.spcId) + ',' +st.db.escape(educationData.scoreFrom)
                                                    + ',' +st.db.escape(educationData.scoreTo)+ ',' +st.db.escape(educationData.level)
                                                    ;

                                                var query = 'CALL psavejobeducation(' + queryParams + ')';
                                                console.log(query);
                                                st.db.query(query, function (err, result) {
                                                    if (!err) {
                                                        if (result) {
                                                            if (result.affectedRows > 0) {
                                                                console.log('FnupdateSkill:educations: skill matrix Updated successfully');
                                                            }
                                                            else {
                                                                console.log('FnupdateSkill: educations: skill matrix not updated');
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnupdateSkill:  educations:skill matrix not updated')
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnupdateSkill: educations:error in saving  skill matrix:' + err);
                                                    }
                                                });
                                            });
                                        }
                                        else
                                        {educations='';}

                                        matrix(insertresult[0][0].jobid);
                                        console.log('FnSaveJobs: Jobs save successfully');
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

                        var matrix = function(jobId_Result){
                            jobID = jobId_Result;
                            var count = skillMatrix1.length;

                            if(m < skillMatrix1.length) {
                                var skills = {
                                    skillname: skillMatrix1[m].skillname,
                                    expertiseLevel: skillMatrix1[m].expertiseLevel,
                                    expFrom: skillMatrix1[m].exp_from,
                                    expTo: skillMatrix1[m].exp_to,
                                    active_status: skillMatrix1[m].active_status,
                                    jobId: jobID,
                                    fid: skillMatrix1[m].fid,
                                    type : skillMatrix1[m].type
                                };
                                FnSaveSkills(skills, function (err, Result) {
                                    if (!err) {
                                        if (Result) {
                                            resultvalue = Result.SkillID;
                                            var SkillItems = {
                                                skillID: resultvalue,
                                                expertlevel: skills.expertiseLevel,
                                                expFrom: skills.expFrom,
                                                expTo: skills.expTo,
                                                skillstatusid: skills.active_status,
                                                jobid: skills.jobId,
                                                type : skills.type,
                                                fid:skills.fid
                                            };

                                            var queryParams = st.db.escape(SkillItems.jobid) + ',' + st.db.escape(SkillItems.skillID)
                                                + ',' + st.db.escape(SkillItems.expFrom) + ',' + st.db.escape(SkillItems.expTo)
                                                + ',' + st.db.escape(SkillItems.skillstatusid) + ',' + st.db.escape(SkillItems.expertlevel)
                                                + ',' + st.db.escape(parseInt(SkillItems.fid))+ ',' + st.db.escape(SkillItems.type);
                                            var query = 'CALL pSaveJobSkill(' + queryParams + ')';

                                            console.log(query);
                                            st.db.query(query, function (err, result) {
                                                if (!err) {
                                                    console.log('FnupdateSkill: skill matrix Updated successfully');
                                                    m = m + 1;
                                                    matrix(jobID);
                                                }
                                                else {
                                                    console.log('FnupdateSkill:  skill matrix not updated:'+err);
                                                }
                                            });
                                        }
                                        else {
                                            console.log('FnSaveMessage: skillID not loaded');
                                            //res.send(RtnMessage);
                                        }
                                    }
                                    else {
                                        console.log('FnSaveMessage:Error in getting skillID' + err);
                                        //res.send(RtnMessage);
                                    }
                                });
                            }
                            else {
                                postNotification(jobID);
                            }
                        };

                        //send push notification
                        var postNotification = function (jobID) {
                            console.log('job post notification...');
                            var queryParams1 = st.db.escape(jobID) + ',' + st.db.escape(location_id)
                                + ',' + st.db.escape(req.body.exp_from) + ',' + st.db.escape(req.body.exp_to)
                                + ',' + st.db.escape(req.body.salaryFrom)+ ',' + st.db.escape(req.body.salaryTo)
                                + ',' + st.db.escape(req.body.salaryType);
                            console.log('CALL PNotifyForCVsAfterJobPosted(' + queryParams1 + ')');
                            st.db.query('CALL PNotifyForCVsAfterJobPosted(' + queryParams1 + ')', function (err, results) {
                                if (!err) {
                                    if (results) {
                                        if (results[0]) {
                                            if (results[0][0]) {
                                                console.log(results[0]);
                                                for (var i = 0; i < results[0].length; i++) {
                                                    userID = results[0][i].MasterID;
                                                    var queryParams2 = st.db.escape(ezeone_id) + ',' + st.db.escape(userID)+ ',' + st.db.escape(0);
                                                    var query2 = 'CALL pSendMsgRequestbyPO(' + queryParams2 + ')';
                                                    st.db.query(query2, function (err, getResult) {
                                                        if (!err) {
                                                            if (getResult) {

                                                                var path = require('path');
                                                                var file = path.join(__dirname,'../../mail/templates/job_post.html');

                                                                fs.readFile(file, "utf8", function (err, data) {
                                                                    var name = 'select tid,CompanyName from tmaster where EZEID=' + st.db.escape(ezeone_id);
                                                                    st.db.query(name, function (err, companyResult) {
                                                                        if (companyResult) {
                                                                            data = data.replace("[JobType]", jobtype);
                                                                            data = data.replace("[JobTitle]", job_title);
                                                                            data = data.replace("[JobCode]", job_code);
                                                                            data = data.replace("[CompanyName]", companyResult[0].CompanyName);

                                                                            var queryParams3 = st.db.escape(data) + ',' + st.db.escape('') + ',' + st.db.escape('')
                                                                                + ',' + st.db.escape(1) + ',' + st.db.escape('') + ',' + st.db.escape('')
                                                                                + ',' + st.db.escape(token) + ',' + st.db.escape(0) + ',' + st.db.escape(userID)
                                                                                + ',' + st.db.escape(1) + ',' + st.db.escape('') + ',' + st.db.escape(0)+ ',' + st.db.escape(0);
                                                                            var query3 = 'CALL pComposeMessage(' + queryParams3 + ')';
                                                                            st.db.query(query3, function (err, messageResult) {
                                                                                if (!err) {
                                                                                    if (messageResult) {
                                                                                        console.log('FnComposeMessage:Message Composed successfully');
                                                                                        var query4 = 'select tid from tmgroups where GroupType=1 and adminID=' + userID;
                                                                                        st.db.query(query4, function (err, getDetails) {
                                                                                            if (getDetails) {
                                                                                                if (getDetails[0]) {

                                                                                                    var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid=' + userID;
                                                                                                    console.log(queryParameters);
                                                                                                    st.db.query(queryParameters, function (err, iosResult) {
                                                                                                        if (iosResult) {
                                                                                                            iphoneID = iosResult[0].iphoneID;
                                                                                                        }
                                                                                                        else {
                                                                                                            iphoneID = '';
                                                                                                        }
                                                                                                        receiverId = getDetails[0].tid;
                                                                                                        senderTitle = ezeone_id;
                                                                                                        groupTitle = ezeone_id;
                                                                                                        groupId = companyResult[0].tid;
                                                                                                        messageText = data;
                                                                                                        messageType = 8;
                                                                                                        operationType = 0;
                                                                                                        iphoneId = iphoneID;
                                                                                                        messageId = 0;
                                                                                                        masterid = '';
                                                                                                        var latitude = '', longitude = '',prioritys ='', dateTime = '';
                                                                                                        var msgUserid = '', a_name = '';
                                                                                                        var jid = jobID;
                                                                                                        //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                                                        notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid,latitude, longitude, prioritys, dateTime, a_name, msgUserid,jid);
                                                                                                    });
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
                                                                                    else {
                                                                                        console.log("FnComposeMessage:Message Result not loaded");
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    console.log("FnSaveJobs:Error in loading Message Result:" + err);
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                });
                                                            }
                                                            else {
                                                                console.log("FnSaveJobs:Result not loaded");
                                                            }
                                                        }
                                                        else {
                                                            console.log("FnSaveJobs:Error:" + err);
                                                        }
                                                    });
                                                }
                                            }
                                            else {
                                                console.log("FnSaveJobs:MasterId not loaded");
                                            }
                                        }
                                        else {
                                            console.log("FnSaveJobs:MasterId not loaded");
                                        }
                                    }
                                    else {
                                        console.log("FnSaveJobs:MasterId not loaded");
                                    }
                                }
                                else {
                                    console.log("FnSaveJobs:Error:" + err);
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
                            // console.log('CALL psavejoblocation(' + queryParams + ')');
                            st.db.query('CALL psavejoblocation(' + queryParams + ')', function (err, results) {
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
            console.log('FnSaveJobs:error ' + ex.description);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};
function FnSaveSkills(skill, CallBack) {
    var _this = this;
    try {

        //below query to check token exists for the users or not.
        if (skill != null) {
            //var Query = 'select Token from tmaster';
            //70084b50d3c43822fbef
            var RtnResponse = {
                SkillID: 0
            };
            RtnResponse = JSON.parse(JSON.stringify((RtnResponse)));

            st.db.query('Select SkillID from mskill where SkillTitle = ' + st.db.escape(skill.skillname) +' and functionid='+st.db.escape(skill.fid), function (err, SkillResult) {
                if ((!err)) {
                    if (SkillResult[0]) {
                        //console.log(SkillResult);
                        //console.log('Skill value:' + SkillResult[0].SkillID);
                        //console.log('Skill exists');
                        RtnResponse.SkillID = SkillResult[0].SkillID;
                        //console.log(RtnResponse.SkillID);
                        CallBack(null, RtnResponse);
                    }
                    else {
                        st.db.query('insert into mskill (SkillTitle,functionid) values (' + st.db.escape(skill.skillname) + ',' + st.db.escape(skill.fid) +')', function (err, skillInsertResult) {
                            if (!err) {
                                if (skillInsertResult.affectedRows > 0) {
                                    st.db.query('select SkillID from mskill where SkillTitle like ' + st.db.escape(skill.skillname), function (err, SkillMaxResult) {
                                        if (!err) {
                                            if (SkillMaxResult[0]) {
                                                //console.log('New Skill');
                                                RtnResponse.SkillID = SkillMaxResult[0].SkillID;
                                                CallBack(null, RtnResponse);
                                            }
                                            else {
                                                CallBack(null, null);
                                            }
                                        }
                                        else {
                                            CallBack(null, null);
                                        }
                                    });
                                }
                                else {
                                    CallBack(null, null);
                                }
                            }
                            else {
                                CallBack(null, null);
                            }
                        });
                    }
                }
                else {
                    CallBack(null, null);
                }
            });
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('OTP FnSendMailEzeid error:' + ex.description);

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
    var _this = this;

    var ezeone_id = alterEzeoneId(req.query.ezeone_id);
    var token = req.query.token;
    var keywordsForSearch = req.query.keywordsForSearch ? req.query.keywordsForSearch : '';
    var status = req.query.status ? req.query.status : '';
    var pageSize = req.query.page_size;
    var pageCount = req.query.page_count;
    var orderBy = req.query.order_by;  // 1-ascending else descending
    //console.log(req.query);
    var final_result=[],loc_result = [],get_result=[],get_result1,tid, location_result={},jobids,job_location;
    var alumniCode = req.query.a_code ? req.query.a_code : '';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validateStatus = true, error = {};
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
                        var query = st.db.escape(ezeone_id) + ',' + st.db.escape(keywordsForSearch)  + ',' + st.db.escape(status)
                            + ',' + st.db.escape(pageSize) + ',' + st.db.escape(pageCount)  + ',' + st.db.escape(orderBy)
                            + ',' + st.db.escape(alumniCode);
                        console.log('CALL pGetJobs(' + query + ')');
                        st.db.query('CALL pGetJobs(' + query + ')', function (err, getresult) {

                            if (!err) {
                                if (getresult) {
                                    if (getresult[0]) {
                                        if (getresult[0][0]) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Jobs send successfully';
                                            responseMessage.data = {
                                                total_count: getresult[0][0].count,
                                                result : getresult[1]
                                            };
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetJobs: Jobs send successfully');
                                        }
                                        else {
                                            responseMessage.message = 'No founded Jobs details';
                                            console.log('FnGetJobs: No founded Jobs details');
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'No founded Jobs details';
                                        console.log('FnGetJobs: No founded Jobs details');
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.message = 'No founded Jobs details';
                                    console.log('FnGetJobs: No founded Jobs details');
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server : 'Internal serever error'
                                };
                                responseMessage.message = 'Error getting from Jobs details';
                                console.log('FnGetJobs:Error getting from Jobs details:' + err);
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
            console.log('FnGetJobs:error ' + ex.description);
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

    var _this = this;

    var token = req.query.token;
    var mapType = req.query.map_type;

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
        console.log('Error : FnGetJobLocations '+ ex.description);
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
    var _this = this;
    try{
        var latitude = req.query.latitude ? req.query.latitude : 0;
        var longitude = req.query.longitude ? req.query.longitude : 0;
        var proximity = (req.query.proximity) ? req.query.proximity : 0;
        var jobType = req.query.jobType ? req.query.jobType : '';
        var exp = (req.query.exp) ? req.query.exp : -1;
        var keywords = req.query.keywords ? req.query.keywords : '';
        var token = (req.query.token) ? req.query.token : '';
        var pageSize = req.query.page_size;
        var pageCount = req.query.page_count;
        var locations = req.query.locations ? req.query.locations : '';
        var category = req.query.category ? req.query.category : '';
        var salary = req.query.salary ? req.query.salary : '';
        var filter = req.query.filter ? req.query.filter : 0;
        var restrictToInstitue = req.query.restrict ? req.query.restrict : 0;
        var type = req.query.type ? parseInt(req.query.type) : 0;  //0-normal job search, 1-Show my institue jobs, 2-for matching jobs of my cv and Default is 0
        var toEzeid = req.query.to_ezeone ? alterEzeoneId(req.query.to_ezeone) : '';

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
            +',' + st.db.escape(toEzeid);
        console.log('CALL psearchjobs(' + query + ')');
        st.db.query('CALL psearchjobs(' + query + ')', function (err, getresult) {
            //console.log(getresult);

            if (!err) {
                if (getresult) {
                    if (getresult[0]) {
                        if (getresult[0][0]) {
                            if (getresult[1].length > 0) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Jobs Search result loaded successfully';
                                if (filter == 0) {
                                    responseMessage.data = {
                                        total_count: getresult[0][0].count,
                                        result: getresult[1],
                                        job_location: getresult[2],
                                        salary: getresult[3],
                                        category: getresult[4],
                                        company_details: getresult[5]
                                    };
                                }
                                else {
                                    responseMessage.data = {
                                        total_count: getresult[0][0].count,
                                        result: getresult[1]
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
        console.log('FnSearchJobs:error ' + ex.description);
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

    try {
        var keyword = req.body.keyword ? req.body.keyword : '';
        var jobType = req.body.job_type;
        var salaryFrom = req.body.salary_from;
        var salaryTo = req.body.salary_to;
        var salaryType = req.body.salary_type;
        var experienceFrom = req.body.experience_from;
        var experienceTo = req.body.experience_to;
        var locationIds = req.body.location_ids;
        var instituteId = req.body.institute_id ? req.body.institute_id : '';
        var pageSize = req.body.page_size ? req.body.page_size : 10;
        var pageCount = req.body.page_count ? req.body.page_count : 0;
        var source = req.body.source;   // 1-internal, 2-for ezeone cvs
        var token = req.body.token;
        var jobSkills = req.body.job_skills;
        jobSkills = JSON.parse(JSON.stringify(jobSkills));
        var educations = req.body.jobEducations;
        educations = JSON.parse(JSON.stringify(educations));
        var locMatrix = req.body.locMatrix;
        locMatrix = JSON.parse(JSON.stringify(locMatrix));
console.log(locationIds);
        var i = 0;
        if (!jobSkills) {
            jobSkills = [];
        }

        /**
         * Validations
         */
        salaryFrom = (parseFloat(salaryFrom) !== NaN && parseFloat(salaryFrom) > 0) ? parseFloat(salaryFrom) : 0;
        salaryTo = (parseFloat(salaryTo) !== NaN && parseFloat(salaryTo) > 0) ? parseFloat(salaryTo) : 0;
        salaryType = (parseInt(salaryType) !== NaN && parseInt(salaryType) > 0) ? parseInt(salaryType) : 1;


        var responseMessage = {
            status: false,
            error: {},
            message: '',
            count: '',
            data: null
        };

        var skillMatrix = ' ', m = 0, eduMatrix = ' ', count, loc = ' ', educationMatrix = ' ', lineofcarrer = ' ', jobSkillMatrix = ' ';


        var job = function (i) {
            if (m < jobSkills.length) {
                var jskills = {
                    skillname: jobSkills[m].skillname,
                    expertiseLevel: jobSkills[m].expertiseLevel,
                    exp_from: jobSkills[m].exp_from,
                    exp_to: jobSkills[m].exp_to,
                    active_status: jobSkills[m].active_status
                };


                FnSkills(jskills, function (err, idResult) {

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
                    job(m);
                });

            }
            else {
                skillMatrix = ' and( ' + skillMatrix + ')';
                next(skillMatrix);
                console.log('sending skill matrix..');
            }
        };


        var next = function (skillMatrix) {
            var skillArray = skillMatrix;
            //educations
            if (educations.length) {
                async.each(educations, function iterator(eduDetails, callback) {

                    count = count - 1;

                    var eduSkills = {
                        education: eduDetails.edu_id,
                        spc: eduDetails.spc_id,
                        score_from: eduDetails.score_from,
                        score_to: eduDetails.score_to

                    };

                    if (eduMatrix == ' ') {

                        eduMatrix = ' (FIND_IN_SET(c.Educationid,' + eduSkills.education + ' ) ' +
                            'AND FIND_IN_SET(c.Specializationids,' + eduSkills.spc + ') ' +
                            'AND c.Score>=' + eduSkills.score_from + ' AND c.Score<=' + eduSkills.score_to + ')';
                    }
                    else {
                        eduMatrix = eduMatrix + ' or' + ' (FIND_IN_SET(c.Educationid,' + eduSkills.education + ' ) ' +
                            'AND FIND_IN_SET(c.Specializationids,' + eduSkills.spc + ') ' +
                            'AND c.Score>=' + eduSkills.score_from + ' AND c.Score<=' + eduSkills.score_to + ')';
                    }

                });

                if (eduMatrix != ' ') {
                    educationMatrix = ' and ( ' + eduMatrix + ')';
                }
            }
            else {
                educationMatrix = '';
            }

            //line of carrer
            if (locMatrix.length) {
                async.each(locMatrix, function iterator(locDetails, callback) {

                    count = count - 1;

                    var locSkills = {
                        fid: locDetails.fid,
                        locIds: locDetails.career_id,
                        exp_from: locDetails.exp_from,
                        exp_to: locDetails.exp_to,
                        level: locDetails.expertiseLevel

                    };

                    //(FIND_IN_SET(d.Functionid,array) AND FIND_IN_SET(d.LOCid,array) AND FIND_IN_SET(d.Level,array) AND d.Exp>=array AND d.Exp<=array )
                    if (loc == ' ') {

                        loc = ' (FIND_IN_SET(d.Functionid,' + locSkills.fid + ') ' +
                            'AND FIND_IN_SET(d.LOCid,' + locSkills.locIds + ') ' +
                            'AND FIND_IN_SET(d.Level,'+'\'' + locSkills.level + '\') ' +
                            'AND d.Exp>=' + locSkills.exp_from + ' AND d.Exp<=' + locSkills.exp_to + ' )';
                    }
                    else {
                        loc = loc + ' or' + ' (FIND_IN_SET(d.Functionid,' + locSkills.fid + ') ' +
                            'AND FIND_IN_SET(d.LOCid,' + locSkills.locIds + ') ' +
                            'AND FIND_IN_SET(d.Level,'+'\'' + locSkills.level + '\') ' +
                            'AND d.Exp>=' + locSkills.exp_from + ' AND d.Exp<=' + locSkills.exp_to + ' )';
                    }

                });

                if (loc != ' ') {
                    lineofcarrer = ' and ( ' + loc + ')';
                }
            }
            else {
                lineofcarrer = '';
            }

            jobSeeker(skillArray, educationMatrix, lineofcarrer);
        };

        var jobSeeker = function (skillArray, educationMatrix, lineofcarrer) {

            var queryParams = st.db.escape(skillArray) + ',' + st.db.escape(jobType) + ',' + st.db.escape(salaryFrom) + ',' + st.db.escape(salaryTo)
                + ',' + st.db.escape(salaryType) + ',' + st.db.escape(locationIds) + ',' + st.db.escape(experienceFrom)
                + ',' + st.db.escape(experienceTo) + ',' + st.db.escape(instituteId) + ',' + st.db.escape(pageSize)
                + ',' + st.db.escape(pageCount) + ',' + st.db.escape(source)
                + ',' + st.db.escape(token) + ',' + st.db.escape(educationMatrix) + ',' + st.db.escape(lineofcarrer);

            var query = 'CALL pGetjobseekers(' + queryParams + ')';
            console.log('------------');
            console.log(query);
            st.db.query(query, function (err, getResult) {
                console.log(getResult);
                //console.log(getResult[0]);
                if (!err) {
                    if (getResult) {

                        if(getResult[0]){
                            if (getResult[0].length > 0) {

                                if(getResult[1]){
                                    if(getResult[1].length > 0){
                                        for(var ct = 0; ct < getResult[1].length; ct++){
                                            getResult[1][ct].surl = req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/';
                                            console.log(getResult[1][ct]);
                                        }
                                    }
                                }
                                //console.log('.....................................getresult[[1]..................................');
                                //console.log(getResult[1]);
                                //console.log('.......................................................................');

                                responseMessage.status = true;
                                responseMessage.message = 'Job Seeker send successfully';
                                responseMessage.count = getResult[0][0].count;
                                responseMessage.data = getResult[1];

                                console.log(responseMessage);
                                res.status(200).json(responseMessage);
                                console.log('FnGetJobSeeker: Job Seeker send successfully');
                            }
                            else {
                                responseMessage.message = 'Job Seeker not found';
                                console.log('FnGetJobSeeker: Job Seeker not found');
                                res.status(200).json(responseMessage);
                            }

                        }
                        else{
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


        if (jobSkills.length) {
            var m = 0;
            job(m);
        }
        else
        {
            var skillMatrix = '';
            next(skillMatrix);
            console.log('FnGetJobSeeker : skill is empty');
        }
    }

    catch (ex) {
        responseMessage.error = {
            server : 'Internal server error'
        };
        responseMessage.message = 'An error occurred !';
        res.status(400).json(responseMessage);
        console.log('Error : FnJobSeekerSearch ' + ex.description);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }

};

function FnSkills(jskills, CallBack) {
    var _this = this;
    try {
        if (jskills) {

            var RtnResponse = {
                SkillID: 0
            };
            RtnResponse = JSON.parse(JSON.stringify((RtnResponse)));

            st.db.query('Select SkillID from mskill where SkillTitle = ' + st.db.escape(jskills.skillname), function (err, SkillResult) {
                if ((!err)) {
                    if (SkillResult[0]) {
                        RtnResponse.SkillID = SkillResult[0].SkillID;
                        //console.log(RtnResponse.SkillID);
                        CallBack(null, RtnResponse);
                    }
                }
            });
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnJobSkills error:' + ex.description);
        console.log(ex);
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
    var _this = this;

    var token = req.body.token;
    var jobId = req.body.job_id;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};
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
                        var query = st.db.escape(jobId) + ',' + st.db.escape(token);
                        //console.log('CALL pApplyjob(' + query + ')');
                        st.db.query('CALL pApplyjob(' + query + ')', function (err, insertResult) {
                            if (!err) {
                                if (insertResult[0]) {
                                    if (insertResult[0][0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Job apply successfully';
                                        responseMessage.data = insertResult[0][0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnApplyJob: Job apply successfully');
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
            responseMessage.message = 'An error occurred !'
            res.status(400).json(responseMessage);
            console.log('Error : FnApplyJob ' + ex.description);
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
    var _this = this;

    var jobId = req.query.job_id;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

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
                        if(getResult[0].length > 0 ){
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
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnAppliedJobList ' + ex.description);
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
    var _this = this;
    var token = req.query.token;
    var jobId = req.query.job_id;
    var latitude = req.query.lat ? req.query.lat : '';
    var longitude = req.query.lng ? req.query.lng : '';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

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
                        var queryParams = st.db.escape(jobId) + ',' + st.db.escape(token)+ ',' + st.db.escape(latitude)
                            + ',' + st.db.escape(longitude);
                        var query = 'CALL pgetjobDetails(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0].length > 0) {
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
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnLoadMessages: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnLoadMessages:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetJobDetails ' + ex.description);
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
    var _this = this;

    var ezeone_id = alterEzeoneId(req.query.ezeone_id);
    var token = req.query.token;
    var keywordsForSearch = req.query.keywordsForSearch;
    var status = req.query.status;
    var pageSize = req.query.page_size;
    var pageCount = req.query.page_count;
    var orderBy = req.query.order_by;
    var alumniCode = req.query.a_code ? req.query.a_code : '';// 1-ascending else descending
    var output=[];
    //console.log(req.query);

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validateStatus = true, error = {};
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

                                            for( var i=0; i < getresult[1].length;i++){
                                                var data = {
                                                    tid :getresult[1][i].tid,
                                                    jobcode :getresult[1][i].jobcode ,
                                                    jobtitle :getresult[1][i].jobtitle
                                                };
                                                output.push(data);
                                            }
                                            console.log(output);
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Jobs loaded successfully';
                                            responseMessage.data = {
                                                result : output
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
            responseMessage.message = 'An error occured !'
            console.log('FnJobs:error ' + ex.description);
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
    var _this = this;

    var token = req.query.token;
    var pageSize = req.query.page_size;
    var pageCount = req.query.page_count;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        count : 0,
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
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(pageSize) + ',' + st.db.escape(pageCount);
                        var query = 'CALL pGetAppliedJobs(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
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
            console.log('Error : FnAppliedJobList ' + ex.description);
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

    var _this = this;

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
        console.log('Error : FnGetJobcountry '+ ex.description);
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

    var _this = this;

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
            else{
                responseMsg.status = true;
                responseMsg.message = 'City loaded successfully';
                responseMsg.error = null;
                responseMsg.data = result[0];
                res.status(200).json(responseMsg);
            }
        });
    }

    catch(ex){
        res.status(500).json(responseMsg);
        console.log('Error : FnGetjobcity '+ ex.description);
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
    var _this = this;
    var fs = require("fs");
    var token = req.body.token;
    var ids = req.body.ids;
    var templateId = req.body.template_id;
    var jobTitle = req.body.job_title;
    var jobId = req.body.job_id;
    var mailflag = parseInt(req.body.mailflag);
    var id, i,tid,jobResult,messageContent,link;

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

    var validateStatus = true, error = {};

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
                                            if (getResult[0].length > 0) {
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
                                tid = tid;
                                var templateQuery = 'Select * from mmailtemplate where TID = ' + st.db.escape(templateId);
                                st.db.query(templateQuery, function (err, TemplateResult) {

                                    if (!err) {
                                        if (TemplateResult) {
                                            if (TemplateResult.length > 0) {
                                                if (TemplateResult[0]) {
                                                    //console.log(TemplateResult);
                                                    var path = require('path');
                                                    var file = path.join(__dirname,'../../mail/templates/jobseeker_mail.html');

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
                                                                                    //console.log('dataResult......');
                                                                                    //console.log(dataResult);
                                                                                    //console.log('dataResult......');
                                                                                    if (mailflag == 0) {
                                                                                        console.log('mailflag...0');
                                                                                        //console.log(jobResult[0][0].EZEID);

                                                                                        if (jobResult[0][0].EZEID) {
                                                                                            console.log('ezeid is there...');

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
                                                                                    else{
                                                                                        console.log('mailflag...1');
                                                                                        console.log(jobResult[0][0].EZEID);

                                                                                        if (jobResult[0][0].EZEID) {
                                                                                            console.log('ezeid is there');
                                                                                            var queryParams = st.db.escape(dataResult) + ',' + st.db.escape('') + ',' + st.db.escape('')
                                                                                                + ',' + st.db.escape(1) + ',' + st.db.escape('') + ',' + st.db.escape('')
                                                                                                + ',' + st.db.escape(token) + ',' + st.db.escape(0) + ',' + st.db.escape(jobResult[0][0].masterid)
                                                                                                + ',' + st.db.escape(1) + ',' + st.db.escape('') + ',' + st.db.escape(1) + ',' + st.db.escape(0);
                                                                                            var query = 'CALL pComposeMessage(' + queryParams + ')';
                                                                                            //console.log(query);
                                                                                            st.db.query(query, function (err, result) {
                                                                                                if (!err) {
                                                                                                    if (result) {
                                                                                                        if(jobResult[0][0].AdminEmailID){
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
                                                                                                        else{
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
                                                                                        else{
                                                                                            console.log('ezeid is empty');
                                                                                            if(jobResult[0][0].AdminEmailID){

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
                                                                                            else{
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
            console.log('Error : FnGetJobSeekersMailDetails ' + ex.description);
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
    var _this = this;

    var token = req.query.token;

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
                        var queryParams = st.db.escape(token);
                        var query = 'CALL PgetListofjobs(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0].length > 0) {
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
            console.log('Error : FnGetListOfJobs ' + ex.description);
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
    var _this = this;

    var token = req.body.token;
    var jobId = req.body.job_id;

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
            console.log('Error : FnJobRefresh ' + ex.description);
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
    var _this = this;

    var token = req.query.token;

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
                        //console.log('CALL pShowMatchingJobsofCV(' + st.db.escape(token) + ')');
                        st.db.query('CALL pShowMatchingJobsofCV(' + st.db.escape(token) + ')', function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
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
            console.log('Error : FnJobsMatch ' + ex.description);
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
    var _this = this;

    var token = req.query.token;
    var latitude = req.query.latitude;
    var longitude = req.query.longitude;

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
            console.log('Error : FnJobsMatch ' + ex.description);
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
    var _this = this;

    var token = req.query.token;
    var jobId = parseInt(req.query.job_id);

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
            console.log('Error : FnNotifyRelevantStudent ' + ex.description);
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
    var _this = this;

    var token = req.query.token;
    var cvId = req.query.cv_ids;

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
            console.log('Error : FnViewNotifiedCVDetails ' + ex.description);
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
    var _this = this;
    var token = req.query.token;
    var jobId = req.query.job_id;

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
                                    if(getResult[0].length > 0){
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Job Details loaded successfully';
                                        responseMessage.data = {
                                            result: getResult[0],
                                            location : getResult[1],
                                            skill:getResult[2],
                                            line_of_career : getResult[3],
                                            educations : getResult[4]
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
            console.log('Error : FnViewJobDetails ' + ex.description);
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
    var _this = this;
    var fs = require("fs");
    var token = req.body.token;
    var ezeid = alterEzeoneId(req.body.ezeid);
    var ids = req.body.ids;    // tid of student ids
    var templateId = req.body.template_id;
    var jobId = req.body.job_id;
    var id, i, types='',idType,gid, jobResult, link;
    var masterid='',receiverId,toid=[],senderTitle,groupTitle,groupId,messageText,messageType,operationType,iphoneId,messageId;

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
            console.log('Error : FnJobNotification ' + ex.description);
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
    var _this = this;
    var token = req.query.token;
    var keywords = req.query.keywords;

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
                        var queryParams =  st.db.escape(keywords);
                        var query = 'CALL pFindInstitute(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if(getResult[0].length > 0){
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
            console.log('Error : FnSearchInstitute ' + ex.description);
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
    var _this = this;

    var token = req.body.token;
    var cvid = parseInt(req.body.cvid);
    var jobId = parseInt(req.body.job_id);

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};
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
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(cvid)+ ',' + st.db.escape(jobId);
                        var query = 'CALL pAddcandtoselectedjob(' + queryParams + ')';
                        st.db.query(query, function (err, insertResult) {
                            if (!err) {
                                if (insertResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'SelectedJob Added successfully';
                                    responseMessage.data = {
                                        cvid : parseInt(req.body.cvid),
                                        job_id : parseInt(req.body.job_id)
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnAddtoSelectedJob: SelectedJob Added successfully');
                                }
                                else {
                                    responseMessage.message = 'SelectedJob not Added';
                                    res.status(200).json(responseMessage);
                                    console.log('FnAddtoSelectedJob:SelectedJob not Added');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnAddtoSelectedJob: error in saving SelectedJob Added :' + err);
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
            console.log('Error : FnAddtoSelectedJob ' + ex.description);
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
    var _this = this;

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

    var validateStatus = true,error = {};
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
            console.log('Error : FnSaveJobLoaction ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


module.exports = Job;