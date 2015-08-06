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
    var categoryID = req.body.category_id;
    var educationID= (req.body.education_id) ? req.body.education_id : '';
    var specializationID = (req.body.specialization_id) ? req.body.specialization_id : '';
    var instituteID = (req.body.institute_id) ? req.body.institute_id : '';
    var aggregateScore = req.body.aggregate_score;
    if(typeof(locationsList) == "string") {
        locationsList = JSON.parse(locationsList);
    }
    var location_id = '';
    console.log('******************');
    console.log(locationsList);
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
                                + ',' + st.db.escape(email_id) + ',' + st.db.escape(mobileNo) + ',' + st.db.escape(location_id)
                                + ',' + st.db.escape(categoryID)+ ',' + st.db.escape(educationID)+ ',' + st.db.escape(specializationID)
                                + ',' + st.db.escape(instituteID)+ ',' + st.db.escape(aggregateScore);
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
                                            location_id: location_id,
                                            categoryID : categoryID,
                                            educationID :educationID,
                                            specializationID : specializationID,
                                            instituteID : instituteID,
                                            aggregateScore : aggregateScore
                                        };
                                        res.status(200).json(responseMessage);
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


                        var insertLocations = function(locationDetails){
                            var list = {
                                location_title: locationDetails.location_title,
                                latitude: locationDetails.latitude,
                                longitude: locationDetails.longitude,
                                country: locationDetails.country,
                                maptype : locationDetails.maptype
                            };

                            console.log(list);
                            var queryParams = st.db.escape(list.location_title) + ',' + st.db.escape(list.latitude)
                                + ',' + st.db.escape(list.longitude) + ',' + st.db.escape(list.country)+ ',' + st.db.escape(list.maptype);

                            st.db.query('CALL psavejoblocation(' + queryParams + ')', function (err, results) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {

                                            console.log(results[0][0].id);

                                            location_id += results[0][0].id + ',';
                                            locCount +=1;
                                            console.log('---------------');
                                            console.log(location_id);
                                            console.log(locCount);
                                            console.log('---------------********');
                                            console.log(locationsList.length);
                                            if(locCount < locationsList.length){
                                                console.log('sucess..............1');
                                                insertLocations(locationsList[locCount]);
                                            }
                                            else{
                                                console.log('sucess..............2');
                                                console.log(location_id);
                                                createJobPosting();
                                            }
                                        }
                                        else {
                                            console.log('FnSaveJobLocation:results no found');
                                            responseMessage.message = 'results no found';
                                            console.log('FnSaveJobLocation: results no found');
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        console.log('FnSaveJobLocation:results no found');
                                        responseMessage.message = 'results no found';
                                        console.log('FnSaveJobLocation: results no found');
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    console.log('FnSaveJobLocation:results no found');
                                    responseMessage.message = 'results no found';
                                    console.log('FnSaveJobLocation: results no found');
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

    var ezeone_id = alterEzeoneId(req.query.ezeone_id);
    var token = req.query.token;
    var keywordsForSearch = req.query.keywordsForSearch;
    var status = req.query.status;
    var pageSize = req.query.page_size;
    var pageCount = req.query.page_count;
    var orderBy = req.query.order_by;  // 1-ascending else descending
        //console.log(req.query);
    var final_result=[],loc_result = [],get_result=[],get_result1,tid, location_result={},jobids,job_location;

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
                                                result : getresult[1],
                                                job_location: getresult[2]

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
            responseMessage.message = 'An error occured !'
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
    var latitude = req.query.latitude;
    var longitude = req.query.longitude;
    var proximity = (req.query.proximity) ? req.query.proximity : 0;
    var jobType = req.query.jobType;
    var exp = (req.query.exp) ? req.query.exp : -1;
    var keywords = req.query.keywords;
    var token = (req.query.token) ? req.query.token : '';
    var pageSize = req.query.page_size;
    var pageCount = req.query.page_count;
    var locations = req.query.locations ? req.query.locations : '';
    var category = req.query.category ? req.query.category : '';
    var salary = req.query.salary ? req.query.salary : '';
    var filter = req.query.filter ? req.query.filter : 0;
    var restrictToInstitue = req.query.restrict ? req.query.restrict : 0;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var query = st.db.escape(latitude) + ',' + st.db.escape(longitude) + ',' + st.db.escape(proximity)+ ',' + st.db.escape(jobType)
            + ',' + st.db.escape(exp) + ',' + st.db.escape(keywords)+',' + st.db.escape(token)+',' + st.db.escape(pageSize)
            +',' + st.db.escape(pageCount)+',' + st.db.escape(locations)+',' + st.db.escape(category)
            +',' + st.db.escape(salary)+',' + st.db.escape(filter)+',' + st.db.escape(restrictToInstitue);

                            console.log(query);
                            st.db.query('CALL psearchjobs(' + query + ')', function (err, getresult) {
                                if (!err) {
                                    if (getresult) {
                                        if (getresult[0]) {
                                            if (getresult[0][0]) {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Jobs Search result loaded successfully';
                                                if(filter == 0) {
                                                    responseMessage.data = {
                                                        total_count: getresult[0][0].count,
                                                        result: getresult[1],
                                                        job_location: getresult[2],
                                                        salary: getresult[3],
                                                        category: getresult[4]
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
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for job seeker search
 */
Job.prototype.searchJobSeekers = function(req,res) {

    try {
        var keyword = req.query.keyword ? req.query.keyword  : '';
        var jobType = req.query.job_type;
        var salaryFrom = req.query.salary_from;
        var salaryTo = req.query.salary_to;
        var salaryType = req.query.salary_type;
        var experienceFrom = req.query.experience_from;
        var experienceTo = req.query.experience_to;
        var locationIds = req.query.location_ids;
        var educations = req.query.educations ? req.query.educations : '';
        var specializationId =  req.query.specialization_id ? req.query.specialization_id : '';
        var instituteId =  req.query.institute_id ? req.query.institute_id : '';
        var scoreFrom = req.query.score_from ? req.query.score_from : 0;
        var scoreTo = req.query.score_to ? req.query.score_to : 0;
        var pageSize = req.query.page_size ? req.query.page_size : 10;
        var pageCount = req.query.page_count ? req.query.page_count : 0;

        /**
         * Validations
         */
        salaryFrom = (parseFloat(salaryFrom) !== NaN && parseFloat(salaryFrom) > 0) ? parseFloat(salaryFrom) : 0;
        salaryTo = (parseFloat(salaryTo) !== NaN && parseFloat(salaryTo) > 0) ? parseFloat(salaryTo) : 0;
        salaryType = (parseInt(salaryType) !== NaN && parseInt(salaryType) > 0) ? parseInt(salaryType) : 1;
        experienceFrom = (parseInt(experienceFrom) !== NaN && parseInt(experienceFrom) > 0) ? parseInt(experienceFrom) : 0;
        experienceTo = (parseInt(experienceTo) !== NaN && parseInt(experienceTo) > 0) ? parseInt(experienceTo) : 0;


        var responseMessage = {
            status: false,
            error: {},
            message: '',
            count : '',
            data: null
        };


            var queryParams = st.db.escape(keyword) + ',' + st.db.escape(jobType) + ',' + st.db.escape(salaryFrom) + ',' + st.db.escape(salaryTo)
                + ',' + st.db.escape(salaryType) +',' + st.db.escape(locationIds) + ',' + st.db.escape(experienceFrom)
                + ',' + st.db.escape(experienceTo)+ ',' + st.db.escape(educations)+ ',' + st.db.escape(specializationId)
                + ',' + st.db.escape(instituteId)+ ',' + st.db.escape(scoreFrom)+ ',' + st.db.escape(scoreTo)
                + ',' + st.db.escape(pageSize)+ ',' + st.db.escape(pageCount);


            var query = 'CALL pGetjobseekers(' + queryParams + ')';
            console.log(query);
            st.db.query(query, function (err, getResult) {
                console.log(getResult);
                if (!err) {
                    if (getResult) {
                        if (getResult[0].length >0 ) {
                            responseMessage.status = true;
                            responseMessage.message = 'Job Seeker send successfully';
                            responseMessage.data = getResult[1];
                            responseMessage.count = getResult[0][0].count;
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
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error getting from Job Seeker';
                    console.log('FnGetJobSeeker:Error getting from Job Seeker:' + err);
                    res.status(500).json(responseMessage);
                }
            });
    }
    catch (ex) {
        responseMessage.error = {
            server : 'Internal server error'
        };
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
                        console.log('CALL pApplyjob(' + query + ')');
                        st.db.query('CALL pApplyjob(' + query + ')', function (err, insertResult) {
                            console.log(insertResult);
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
                                    console.log(responseMessage);
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
            console.log('CALL pgetlistofcandappliedforjob(' + st.db.escape(jobId) + ')');
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
            console.log('CALL pgetjobDetails(' + st.db.escape(jobId) + ')');
            st.db.query('CALL pgetjobDetails(' + st.db.escape(jobId) + ')', function (err, getResult) {
                console.log(getResult);
                if (!err) {
                    if (getResult) {
                        if(getResult[0].length > 0){
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
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
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
    var orderBy = req.query.order_by;  // 1-ascending else descending
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
                            + ',' + st.db.escape(pageSize) + ',' + st.db.escape(pageCount)  + ',' + st.db.escape(orderBy);

                        var query = 'CALL pGetJobs(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getresult) {
                            //console.log(getresult);

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
                        console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
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
 * @todo FnGetJobSeekersMessage
 * Method : post
 * @param req
 * @param res
 * @param next
 * @description api code for Get Job Seekers Mail Details
*/
Job.prototype.getJobSeekersMessage = function(req,res,next){
    var _this = this;

    var token = req.body.token;
    var ids = req.body.ids;
    var templateId = req.body.template_id;
    var jobId = req.body.job_id;
    var id,i=0,tid,jobResult;

    if(ids){
        id = ids.split(",");
        console.log(id.length);
        console.log(id);
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
                                var queryParams = st.db.escape(token) + ',' + st.db.escape(tid)+ ',' + st.db.escape(jobId);
                                var query = 'CALL pGetjobseekersmailDetails(' + queryParams + ')';
                                console.log(query);
                                st.db.query(query, function (err, getResult) {
                                    console.log(getResult);
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
                            i+=1;
                            if(jobResult) {
                                tid = tid;
                                var templateQuery = 'Select * from mmailtemplate where TID = ' + st.db.escape(templateId);
                                st.db.query(templateQuery, function (err, TemplateResult) {

                                    if (!err) {
                                        if (TemplateResult) {
                                            if (TemplateResult.length > 0) {
                                                console.log(TemplateResult);
                                                var mailOptions = {
                                                    replyto: (TemplateResult[0].FromMailID != 'undefined') ? TemplateResult[0].FromMailID : " ",
                                                    to: jobResult[0][0].AdminEmailID,
                                                    subject: TemplateResult[0].Subject,
                                                    html: TemplateResult[0].Body // html body
                                                };
                                                mailOptions.subject = mailOptions.subject.replace("[JobTitle]",jobResult[0][0].jobtitle);
                                                mailOptions.html = mailOptions.html.replace("[JobTitle]",jobResult[0][0].jobtitle);
                                                mailOptions.html = mailOptions.html.replace("[FirstName]", jobResult[0][0].FirstName);
                                                mailOptions.html = mailOptions.html.replace("[LastName]", jobResult[0][0].LastName);
                                                mailOptions.html = mailOptions.html.replace("[CompanyName]", jobResult[0][0].CompanyName);

                                                var queryParams = st.db.escape(mailOptions.html) + ',' + st.db.escape('') + ',' + st.db.escape('')
                                                    + ',' + st.db.escape(1) + ',' + st.db.escape('') + ',' + st.db.escape('')
                                                    + ',' + st.db.escape(token) + ',' + st.db.escape(0) + ',' + st.db.escape(tid)
                                                    + ',' + st.db.escape(0);
                                                var query = 'CALL pComposeMessage(' + queryParams + ')';
                                                console.log(query);
                                                st.db.query(query, function (err, result) {
                                                    if (!err) {
                                                        if (result) {
                                                            console.log('FnGetJobSeekersMailDetails: JobSeeker Message Send Successfully');
                                                            mailDetails(i);
                                                            var query = 'CALL pUpdateMailCountForCV(' + st.db.escape(tid) + ')';
                                                            st.db.query(query, function (err, result) {
                                                                if(!err){
                                                                    console.log(result);
                                                                }
                                                                else{console.log(err);}
                                                            });
                                                        }
                                                        else {
                                                            console.log('FnSendMessage: Message not Saved Successfully');
                                                            mailDetails(i);
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnSendMailer: Message not Saved Successfully');
                                                        mailDetails(i);
                                                    }
                                                });
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
                        responseMessage.message = 'JobSeeker Message Send Successfully';
                        responseMessage.data = null;
                        res.status(200).json(responseMessage);
                        console.log('FnGetJobSeekersMailDetails: JobSeeker Message Send Successfully...1');

                        if (id.length > 0) {
                            mailDetails(i);
                        }
                        else {
                            console.log('FnJobSeekerMail:Invalid ids');
                        }
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
                        console.log(query);
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



module.exports = Job;