/**
 *  @author Gowri shankar
 *  @since July 22,2015  03:42PM
 *  @title Job module
 *  @description Handles Job functions
 */
"use strict";

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
var st = null;
function Job(db,stdLib){

    if(stdLib){
        st = stdLib;
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

    var token = req.body.token;
    var tid = req.body.tid;
    var ezeone_id = alterEzeoneId(req.body.ezeone_id);
    var job_code = req.body.job_code;
    var job_title = req.body.job_title;
    var exp_from = req.body.exp_from;
    var exp_to = req.body.exp_to;
    var job_description = req.body.job_description;
    var salaryFrom = req.body.salaryFrom;
    var salaryTo = req.body.salaryTo;
    var salaryType = req.body.salaryType;
    var keySkills = req.body.keySkills ? req.body.keySkills : '';
    var openings = req.body.openings;
    var jobType = req.body.jobType;
    var status = req.body.status;
    var contactName = req.body.contactName;
    var email_id = req.body.email_id;
    var mobileNo = req.body.mobileNo;
    var locationsList = req.body.locationsList;
    if(typeof(locationsList) == "string") {
        locationsList = JSON.parse(locationsList);
    }
    var location_id = '';

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
    if(!exp_from && !exp_to){
        error['Experience'] = 'Invalid ExperienceFrom or Experience To ';
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
    if(!jobType){
        error['jobType'] = 'Invalid jobType';
        validateStatus *= false;
    }
    //if(!status){
    //    tid = 0;
    //}
    if(parseInt(status) == NaN){
        error['status'] = 'Invalid status';
        validateStatus *= false;
    }
    if(!contactName){
        responseMessage.error['contactName'] = 'Invalid contactName';
        validateStatus *= false;
    }
    if(!locationsList){
        locationsList = [];
    }
    if(!(email_id || mobileNo)){
        error['email_id OR  MobileNo'] = 'Invalid email_id or mobileNo';
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
                        console.log(locationsList.length);

                        var locCount = 0;
                        var locationDetails = locationsList[locCount];
                        location_id = location_id.substr(0,location_id.length - 1);
                        var createJobPosting = function(){
                            var query = st.db.escape(tid) + ',' + st.db.escape(ezeone_id) + ',' + st.db.escape(job_code)
                                + ',' + st.db.escape(job_title) + ',' + st.db.escape(exp_from) + ',' + st.db.escape(exp_to)
                                + ',' + st.db.escape(job_description) + ',' + st.db.escape(salaryFrom) + ',' + st.db.escape(salaryTo)
                                + ',' + st.db.escape(salaryType) + ',' + st.db.escape(keySkills) + ',' + st.db.escape(openings)
                                + ',' + st.db.escape(jobType) + ',' + st.db.escape(status) + ',' + st.db.escape(contactName)
                                + ',' + st.db.escape(email_id) + ',' + st.db.escape(mobileNo) + ',' + st.db.escape(location_id);
                            console.log('CALL pSaveJobs(' + query + ')');
                            st.db.query('CALL pSaveJobs(' + query + ')', function (err, insertresult) {
                                console.log(insertresult);

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
                                            location_id: location_id
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnSaveJobs: Jobs save successfully');
                                    }
                                    else {
                                        responseMessage.message = 'No save Jobs details';
                                        responseMessage.error = {};
                                        res.status(400).json(responseMessage);
                                        console.log('FnSaveJobs:No save Jobs details');
                                    }
                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    responseMessage.error = {};
                                    res.status(500).json(responseMessage);
                                    console.log('FnSaveJobs: error in saving jobs details:' + err);
                                }
                            });
                        };


                        var insertLocations = function(locationDetails){
                            var list = {
                                location_title: locationDetails.location_title,
                                latitude: locationDetails.latitude,
                                longitude: locationDetails.longitude,
                                country: locationDetails.country
                            };
                            var queryParams = st.db.escape(list.location_title) + ',' + st.db.escape(list.latitude)
                                + ',' + st.db.escape(list.longitude) + ',' + st.db.escape(list.country);

                            st.db.query('CALL psavejoblocation(' + queryParams + ')', function (err, results) {

                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {

                                            console.log(results[0][0].id);
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
                                            responseMessage.error = {};
                                            responseMessage.message = 'results no found';
                                            console.log('FnSaveJobLocation: results no found');
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        console.log('FnSaveJobLocation:results no found');
                                        responseMessage.error = {};
                                        responseMessage.message = 'results no found';
                                        console.log('FnSaveJobLocation: results no found');
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    console.log('FnSaveJobLocation:results no found');
                                    responseMessage.error = {};
                                    responseMessage.message = 'results no found';
                                    console.log('FnSaveJobLocation: results no found');
                                    res.status(200).json(responseMessage);
                                }
                            });
                        };
                        //calling function at first time
                        if (locationDetails) {
                            if (locationDetails.length > 0) {
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
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveJobs: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveJobs:Error in processing Token' + err);
                }
            });
        }
        catch(ex){
            responseMessage.error = {};
            responseMessage.message = 'An error occurred !'
            console.log('FnSaveJobs:error ' + ex.description);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
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

    var error = {};
    var ezeone_id = alterEzeoneId(req.query.ezeone_id);
    var token = req.query.token;
    var keywordsForSearch = req.query.keywordsForSearch;
    var status = req.query.status;
    var pageSize = req.query.page_size;
    var pageCount = req.query.page_count;
    var orderBy = req.query.order_by;  // 1-ascending else descending
        console.log(req.query);
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
                            + ',' + st.db.escape(pageSize) + ',' + st.db.escape(pageCount)  + ',' + st.db.escape(orderBy);
                        console.log(query);
                        console.log('CALL pGetJobs(' + query + ')');
                        st.db.query('CALL pGetJobs(' + query + ')', function (err, getresult) {
                            console.log(getresult);
                            if (!err) {
                                if (getresult) {
                                    if (getresult[0].length) {
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
                                        responseMessage.error = {};
                                        responseMessage.message = 'No founded Jobs details';
                                        console.log('FnGetJobs: No founded Jobs details');
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.error = {};
                                    responseMessage.message = 'No founded Jobs details';
                                    console.log('FnGetJobs: No founded Jobs details');
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {};
                                responseMessage.message = 'Error getting from Jobs details';
                                console.log('FnGetJobs:Error getting from Jobs details:' + err);
                                res.status(500).json(responseMessage);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnGetJobs: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetJobs:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {};
            responseMessage.message = 'An error occured !'
            console.log('FnGetJobs:error ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(400).json(responseMessage);
        }
    }
    };

Job.prototype.getJobLocations = function(req,res,next){
    /**
     * @todo FnGetJobLocations
     */
    var _this = this;
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
    var latitude = req.query.latitude;
    var longitude = req.query.longitude;
    var proximity = req.query.proximity;
    var jobType = req.query.jobType;
    var exp = req.query.exp;
    var keywords = req.query.keywords;
    var token = (req.query.token) ? req.query.token : '';
    var pageSize = req.query.page_size;
    var pageCount = req.query.page_count;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var query = st.db.escape(latitude) + ',' + st.db.escape(longitude) + ',' + st.db.escape(proximity)+ ',' + st.db.escape(jobType)
            + ',' + st.db.escape(exp) + ',' + st.db.escape(keywords)+',' + st.db.escape(token)+',' + st.db.escape(pageSize)
            +',' + st.db.escape(pageCount);

                            console.log(query);
                            st.db.query('CALL psearchjobs(' + query + ')', function (err, getresult) {
                                console.log(getresult)
                                console.log(getresult[0][0].count);
                                console.log(getresult[1]);

                                if (!err) {
                                    if (getresult) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Jobs details loaded successfully';
                                        responseMessage.data = {
                                            total_count: getresult[0][0].count,
                                            result : getresult[1]
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnSearchJobs: Jobs save successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Jobs details not found';
                                        responseMessage.error = {};
                                        res.status(400).json(responseMessage);
                                        console.log('FnSearchJobs:Jobs details not found');
                                    }
                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    responseMessage.error = {};
                                    res.status(500).json(responseMessage);
                                    console.log('FnSearchJobs: error in getting job details:' + err);
                                }
                            });

        }
        catch(ex){
            responseMessage.error = {};
            responseMessage.message = 'An error occurred !';
            console.log('FnSearchJobs:error ' + ex.description);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    };

Job.prototype.searchJobSeekers = function(req,res) {
    /**
     * @todo Code API for Job seeker search
     */
    //res.send('API in progress');
    try {
        var keyword = req.query.keyword;
        var jobType = req.query.job_type;
        var salaryFrom = req.query.salary_from;
        var salaryTo = req.query.salary_to;
        var salaryType = req.query.salary_type;
        var experienceFrom = req.query.experience_from;
        var experienceTo = req.query.experience_to;
        var locationsList = req.query.locations;

        if (typeof(locationsList) == "string") {
            locationsList = JSON.parse(locationsList);
        }

        if (!locationsList) {
            locationsList = [];
        }
        console.log(req.query);
        /**
         * Validations
         */
        keyword = (keyword) ? keyword : null;
        jobType = (jobType) ? jobType : null; // Comma Separated
        salaryFrom = (parseFloat(salaryFrom) !== NaN && parseFloat(salaryFrom) > 0) ? parseFloat(salaryFrom) : 0;
        salaryTo = (parseFloat(salaryTo) !== NaN && parseFloat(salaryTo) > 0) ? parseFloat(salaryTo) : 0;
        salaryType = (parseInt(salaryType) !== NaN && parseInt(salaryType) > 0) ? parseInt(salaryType) : 1;
        experienceFrom = (parseInt(experienceFrom) !== NaN && parseInt(experienceFrom) > 0) ? parseInt(experienceFrom) : 0;
        experienceTo = (parseInt(experienceTo) !== NaN && parseInt(experienceTo) > 0) ? parseInt(experienceTo) : 0;


        var responseMessage = {
            status: false,
            error: {},
            message: '',
            data: null
        };


        var queryParams = [];
        var locationIds = '';
        var locCount = 0;
        var locationDetails = locationsList[locCount];

        /**
         * Job search for job seeker
         */
        var jobSeekerJobSearch = function () {
            //PROCEDURE `pGetjobseekers`(IN tKeyWordsForSearch text,In tjobtype INT,IN tsalaryfrom DECIMAL(14,2),IN tsalaryTo DECIMAL(14,2),IN tsalarytype INT,In tlocations VARCHAR(150),In tExpfrom DECIMAL(14,2),IN tExpto DECIMAL(14,2))
            locationIds = locationIds.substr(0, locationIds.length - 1);
            var queryParams = st.db.escape(keyword) + ',' + st.db.escape(jobType) + ',' + st.db.escape(salaryFrom) + ',' + st.db.escape(salaryTo)
                + ',' + st.db.escape(salaryType) +
                ',' + st.db.escape(locationIds) + ',' + st.db.escape(experienceFrom) + ',' + st.db.escape(experienceTo);


            var query = 'CALL pGetjobseekers(' + queryParams + ')';
            console.log(query);
            st.db.query(query, function (err, getResult) {
                if (!err) {
                    if (getResult) {
                        if (getResult[0]) {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Job Seeker send successfully';
                            responseMessage.data = getResult[0];
                            res.status(200).json(responseMessage);
                            console.log('FnGetJobSeeker: Job Seeker send successfully');

                        }
                        else {
                            responseMessage.error = null;
                            responseMessage.message = 'Job Seeker not found';
                            console.log('FnGetJobSeeker: Job Seeker not found');
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.error = null;
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

        /**
         * Finds and return location id and if not in database then insert and return the tid
         */
        var insertLocations = function (locationDetails) {
            var list = {
                location_title: locationDetails.location_title,
                latitude: locationDetails.latitude,
                longitude: locationDetails.longitude,
                country: locationDetails.country
            };
            var queryParams = st.db.escape(list.location_title) + ',' + st.db.escape(list.latitude)
                + ',' + st.db.escape(list.longitude) + ',' + st.db.escape(list.country);

            st.db.query('CALL psavejoblocation(' + queryParams + ')', function (err, results) {

                if (results) {
                    if (results[0]) {
                        if (results[0][0]) {
                            console.log(results[0][0].id);
                            locationIds += results[0][0].id + ',';
                            locCount += 1;
                            if (locCount < locationsList.length) {
                                insertLocations(locationsList[locCount]);
                            }
                            else {
                                jobSeekerJobSearch();
                            }
                        }
                        else {
                            console.log('FnSaveJobLocation:results no found');
                            responseMessage.error = {};
                            responseMessage.message = 'results no found';
                            console.log('FnSaveJobLocation: results no found');
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        console.log('FnSaveJobLocation:results no found');
                        responseMessage.error = {};
                        responseMessage.message = 'results no found';
                        console.log('FnSaveJobLocation: results no found');
                        res.status(200).json(responseMessage);
                    }
                }
                else {
                    console.log('FnSaveJobLocation:results no found');
                    responseMessage.error = {};
                    responseMessage.message = 'results no found';
                    console.log('FnSaveJobLocation: results no found');
                    res.status(200).json(responseMessage);
                }
            });
        };
        //calling function at first time
        if (locationDetails) {
            if (locationDetails.length > 0) {
                insertLocations(locationDetails);
            }
            else {
                locationIds = '';
                jobSeekerJobSearch();
            }

        }

        else {
            locationIds = '';
            jobSeekerJobSearch();
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occurred !';
        res.status(400).json(responseMessage);
        console.log('Error : FnJobSeekerSearch ' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
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
            responseMessage.message = 'Please check the errors below';
            res.status(400).json(responseMessage);
        }
        else {
            try {
                st.validateToken(token, function (err, result) {
                    if (!err) {
                        if (result) {
                            var query = st.db.escape(jobId) + ',' + st.db.escape(token);
                            console.log('CALL pApplyjob(' + query + ')');
                            st.db.query('CALL pApplyjob(' + query + ')', function (err, insertResult) {
                                if (!err) {
                                    if (insertResult) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Job applied successfully';
                                        responseMessage.data = {
                                            token: token,
                                            jobId: jobId
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnApplyJob: Job applied successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Job applied not successfully';
                                        responseMessage.error = null;
                                        res.status(400).json(responseMessage);
                                        console.log('FnApplyJob:Job applied not successfully');
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
                            console.log('FnSaveJobs: Invalid token');
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'Error in validating Token';
                        res.status(500).json(responseMessage);
                        console.log('FnSaveJobs:Error in processing Token' + err);
                    }
                });
            }
            catch (ex) {
                responseMessage.error = {
                    server: 'Internal Server Error'
                };
                responseMessage.message = 'An error occurred !'
                res.status(500).json(responseMessage);
                console.log('Error : FnGetJobLocations ' + ex.description);
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

    var validateStatus = true, error = 'Invalid parameters';

    if(!jobId){
        error['jobId'] = 'Invalid job ID';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            console.log('CALL pgetlistofcandappliedforjob(' + st.db.escape(jobId) + ')');
            st.db.query('CALL pgetlistofcandappliedforjob(' + st.db.escape(jobId) + ')', function (err, getResult) {
                if (!err) {
                    if (getResult) {
                        if(getResult[0].length){
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Applied job List loaded successfully';
                            responseMessage.data = getResult[0];
                            res.status(200).json(responseMessage);
                            console.log('FnAppliedJobList: Applied job List loaded successfully');
                        }
                        else {
                            responseMessage.message = 'Applied job List not loaded';
                            responseMessage.error = null;
                            res.status(200).json(responseMessage);
                            console.log('FnAppliedJobList:Applied job List not loaded');
                        }
                    }
                    else {
                        responseMessage.message = 'Applied job List not loaded';
                        responseMessage.error = null;
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
            console.log('Error : FnGetJobLocations ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

Job.prototype.getFiltersForJob = function(req,res,next){
    /**
     * @todo FnGetFiltersForJob
     */
    var _this = this;
    var responseMsg = {
        status : false,
        data : [],
        message : 'Unable to load job filters ! Please try again',
        error : {
            server : 'An internal server error'
        }
    };

    try{
        st.db.query('CALL pgetmasterfiltersforjob()',function(err,result){
            if(err){
                console.log('Error : FnGetFiltersForJob :'+err);
                res.status(400).json(responseMsg);
            }
            else{
                console.log(result);
                responseMsg.status = true;
                responseMsg.message = 'Job filters loaded successfully';
                responseMsg.error = null;
                responseMsg.data = {
                    location_information : result[0],
                    salary : result[1],
                    job_type: result[2]
                };
                res.status(200).json(responseMsg);
            }
        });
    }

    catch(ex){
        res.status(500).json(responseMsg);
        console.log('Error : FnGetFiltersForJob '+ ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};


module.exports = Job;