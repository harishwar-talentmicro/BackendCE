/**
 * Created by vedha on 24-11-2016.
 */
var moment = require('moment');
var jobCtrl = {};


jobCtrl.saveJob = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};


    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.body.jobTitle) {
        error.jobTitle = 'Invalid jobTitle';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.st.validateToken(req.query.token,function(err,tokenResult){

                if((!err) && tokenResult){


                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.body.jobId ? req.body.jobId : 0),
                        req.st.db.escape(req.body.jobTitle),
                        req.st.db.escape(req.body.jobDescription ? req.body.jobDescription : ''),
                        req.st.db.escape(req.body.keywords ? req.body.keywords : ''),
                        req.st.db.escape(req.body.status ? req.body.status : 1) ,
                        req.st.db.escape(req.body.address),
                        req.st.db.escape(req.body.latitude),
                        req.st.db.escape(req.body.longitude),
                        req.st.db.escape(req.body.expFrom ? req.body.expFrom : null),
                        req.st.db.escape(req.body.expTo ? req.body.expTo : null)
                    ];

                    var procQuery = 'CALL p_m_savejob( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery,function(err,result){
                        if(!err && result){
                            response.status = true;
                            response.message = "Job saved successfully";
                            response.error = null;
                            response.data = {
                                jobId : result[0][0].jobId ,
                                jobTitle : req.body.jobTitle,
                                jobDescription : req.body.jobDescription ? req.body.jobDescription : '',
                                keywords : req.body.keywords ? req.body.keywords : '',
                                status : req.body.status ? req.body.status : 1,
                                address : req.body.address,
                                latitude : req.body.latitude,
                                longitude : req.body.longitude,
                                expFrom : req.body.expFrom ? req.body.expFrom : '',
                                expTo : req.body.expTo ? req.body.expTo : ''
                            };
                            res.status(200).json(response);
                        }
                        else{
                            response.status = false;
                            response.message = "Error while saving job";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                else{
                    res.status(401).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

jobCtrl.updateJob = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.body.jobId) {
        error.jobTitle = 'Invalid jobId';
        validationFlag *= false;
    }
    if (!req.body.jobTitle) {
        error.jobTitle = 'Invalid jobTitle';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.st.validateToken(req.query.token,function(err,tokenResult){

                if((!err) && tokenResult){





                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.body.jobId ? req.body.jobId : 0),
                        req.st.db.escape(req.body.jobTitle),
                        req.st.db.escape(req.body.jobDescription ? req.body.jobDescription : ''),
                        req.st.db.escape(req.body.keywords ? req.body.keywords : ''),
                        req.st.db.escape(req.body.status ? req.body.status : 1) ,
                        req.st.db.escape(req.body.address),
                        req.st.db.escape(req.body.latitude),
                        req.st.db.escape(req.body.longitude),
                        req.st.db.escape(req.body.expFrom ? req.body.expFrom : null),
                        req.st.db.escape(req.body.expTo ? req.body.expTo : null)
                    ];

                    var procQuery = 'CALL p_m_savejob( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery,function(err,result){
                        if(!err && result){
                            response.status = true;
                            response.message = "Job saved successfully";
                            response.error = null;
                            response.data = {
                                jobId : result[0][0].jobId ,
                                jobTitle : req.body.jobTitle,
                                jobDescription : req.body.jobDescription ? req.body.jobDescription : '',
                                keywords : req.body.keywords ? req.body.keywords : '',
                                status : req.body.status ? req.body.status : 1,
                                address : req.body.address,
                                latitude : req.body.latitude,
                                longitude : req.body.longitude,
                                expFrom : req.body.expFrom ? req.body.expFrom : '',
                                expTo : req.body.expFrom ? req.body.expTo : ''
                            };
                            res.status(200).json(response);
                        }
                        else{
                            response.status = false;
                            response.message = "Error while saving job";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                else{
                    res.status(401).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

jobCtrl.getJobList = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.st.validateToken(req.query.token,function(err,tokenResult){
                if((!err) && tokenResult){

                    req.query.limit = (req.query.limit) ? (req.query.limit) : 10;
                    req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                    var startPage = 0;

                    startPage = ((((parseInt(req.query.pageNo)) * req.query.limit) + 1) - req.query.limit) - 1;

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.status),
                        req.st.db.escape(startPage),
                        req.st.db.escape(req.query.limit)

                    ];
                    var procQuery = 'CALL  get_jobs( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery,function(err,result){
                        console.log(result) ;
                        if(!err && result && result[0]){
                            var output =[];
                            for( var i=0; i < result[0].length;i++){
                                var result1 = {};
                                result1.jobId =result[0][i].jobId,
                                    result1.jobTitle = result[0][i].jobTitle,
                                    result1.status = result[0][i].status,
                                    result1.jobDescription = result[0][i].jobDescription,
                                    result1.keywords = result[0][i].keywords,
                                    result1.details =  JSON.parse(result[0][i].details),
                                   // result1.locationsList =  JSON.parse(result[0][i].locationsList),
                                    result1.address =  result[0][i].address,
                                    result1.latitude =  result[0][i].latitude,
                                    result1.longitude =  result[0][i].longitude,
                                    result1.applicantCount = result[0][i].applicantCount,
                                result1.createdDate =  result[0][i].createdDate,
                                    result1.expFrom =  result[0][i].expFrom,
                                    result1.expTo =  result[0][i].expTo
                                output.push(result1);
                            }

                            res.status(200).json({status: true,
                                message: "Job list loaded successfully",
                                error : null,
                                data: {
                                    jobList :output,
                                     count : result[1][0].totalCount
                                }
                            });

                        }
                        else{
                            response.status = false;
                            response.message = "Error while getting jobs";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                else{
                    res.status(401).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

jobCtrl.getJobseekerList = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.jobId) {
        error.jobTitle = 'Invalid jobId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.st.validateToken(req.query.token,function(err,tokenResult){
                if((!err) && tokenResult){

                    req.query.limit = (req.query.limit) ? (req.query.limit) : 10;
                    req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                    var startPage = 0;
                    startPage = ((((parseInt(req.query.pageNo)) * req.query.limit) + 1) - req.query.limit) - 1;

                    var procParams = [
                        req.st.db.escape(req.query.jobId),
                        req.st.db.escape((req.query.stageId) ? (req.query.stageId) :0 ),
                        req.st.db.escape(startPage),
                        req.st.db.escape(req.query.limit)

                    ];
                    var procQuery = 'CALL  pget_jobs_jobseeker_list( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery,function(err,result){
                        if(!err && result && result[0]){

                            res.status(200).json({status: true,
                                message: "Jobseeker list loaded successfully",
                                error : null,
                                data: {
                                    jobseekerList : JSON.parse(JSON.stringify(result[0])),
                                    count : result[1][0].totalCount,
                                    stageList : JSON.parse(JSON.stringify(result[2]))
                                }
                            });

                        }
                        else{
                            response.status = false;
                            response.message = "Error while getting candidates";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                else{
                    res.status(401).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

jobCtrl.updateJobseekerTransStatus = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.body.status) {
        error.jobTitle = 'Invalid status';
        validationFlag *= false;
    }


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.st.validateToken(req.query.token,function(err,tokenResult){

                if((!err) && tokenResult){


                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.body.transId),
                        req.st.db.escape(req.body.status),
                        req.st.db.escape(req.body.notes ? req.body.notes : '')
                    ];

                    var procQuery = 'CALL pUpdateJobseekerTransStatus( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery,function(err,result){
                        if(!err && result){
                            response.status = true;
                            response.message = "Status updated successfully";
                            response.error = null;
                            response.data = null ;
                            res.status(200).json(response);
                        }
                        else{
                            response.status = false;
                            response.message = "Error while updating status";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                else{
                    res.status(401).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};


jobCtrl.applyJob = function(req,res,next){

    var token = req.query.token;
    var jobId = req.body.jobId;
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
            req.st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var query = req.st.db.escape(token) + ',' + req.st.db.escape(jobId)+ ',' + req.st.db.escape(status);
                        console.log('CALL apply_job(' + query + ')');
                        req.st.db.query('CALL apply_job(' + query + ')', function (err, insertResult) {
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
                                            var notificationQueryParams = req.st.db.escape(token) + ',' + req.st.db.escape(jobId);
                                            var notificationQuery = 'CALL pnotify_jobcreator_afterApply(' + notificationQueryParams + ')';
                                            console.log(notificationQuery);
                                            req.st.db.query(notificationQuery, function (err, notDetailsRes) {
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

module.exports = jobCtrl;