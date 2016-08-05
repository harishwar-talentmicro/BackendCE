/**
 * @author Anjali Pandya
 * @description Controller for Quick Resume Registration Module Area Partner Project
 * @since August 4, 2016 10:46 AM IST
 */

var SearchResumeCtrl = {};

/**
 * Getting job matching to given search term
 * @param req
 * @param res
 * @param next
 * @service-param token
 * @service-param q (search term)
 * @method GET
 */
SearchResumeCtrl.searchJob = function(req,res,next){
    var response = {
        status : false,
        message : "Job is not available",
        data : null,
        error : {}
    };

    if(!req.query.q){
        response.status = false;
        response.message = "Enter search term to search";
        response.error = {
            q : "Search term missing"
        };
        response.data = null;
        res.status(200).json(response);
        return;
    }

    if(typeof req.query.q == 'string' && (!req.query.q.trim())){
        response.status = false;
        response.message = "Enter search term to search";
        response.error = {
            q : "Search term missing"
        };
        response.data = null;
        res.status(200).json(response);
        return;
    }

    req.st.validateTokenAp(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){
            var procParams = [
                req.st.db.escape(req.query.q)
            ];
            /**
             * Calling procedure to get all job matching to given job title
             * @type {string}
             */
            var procQuery = 'CALL pfindjobs( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,searchResultList){
                if(!err && searchResultList && searchResultList[0]){
                    var outputArray = [];
                    for (var i = 0; i < searchResultList[0].length; i++ ){
                        var result = {};
                        result.jobId = searchResultList[0][i].tid,
                        result.jobTitle = searchResultList[0][i].jobtitle,
                        result.jobCode = searchResultList[0][i].jobcode,
                        outputArray.push(result);
                    }
                    response.status = true;
                    response.message = "Search results loaded successfully";
                    response.error = null;
                    response.data = {
                        searchReasultList : outputArray
                    }
                    res.status(200).json(response);

                }
                else{
                    response.status = false;
                    response.message = "Something went wrong ! Please try again later";
                    response.error = {
                        q : "Internal Server Error"
                    };
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        else{
            res.status(401).json(response);
        }
    });
};

/**
 * Getting details of job according to given jobId
 * @param req
 * @param res
 * @param next
 * @service-param token
 * @service-param jobId {int}
 * @method GET
 */
SearchResumeCtrl.jobDetails = function(req,res,next){
    var response = {
        status : false,
        message : "Job is not available",
        data : null,
        error : {}
    };

    if(!req.query.jobId){
        response.status = false;
        response.message = "Invalid job id";
        response.error = null;
        response.data = null;
        res.status(200).json(response);
        return;
    }
    req.st.validateTokenAp(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){
            var procParams = [
                req.st.db.escape(req.query.jobId)
            ];
            /**
             * Calling procedure to get all details of job according to given jobId
             * @type {string}
             */
            var procQuery = 'CALL pviewjobDetails_v2( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,jobResultList){
                if(!err && jobResultList && jobResultList[0]){

                    response.status = true;
                    response.message = "Job details loaded successfully";
                    response.error = null;

                    jobResultList[0][0].educationList = (jobResultList[4]) ? jobResultList[4] : [];
                    jobResultList[0][0].lineOfCareerList = (jobResultList[3]) ? jobResultList[3] : [];
                    jobResultList[0][0].preferredLocationList = (jobResultList[1]) ? jobResultList[1] : [];
                    jobResultList[0][0].instituteList = (jobResultList[5]) ? jobResultList[5] : [];
                    jobResultList[0][0].skillList = (jobResultList[2]) ? jobResultList[2] : [];
                    jobResultList[0][0].languageList = (jobResultList[6]) ? jobResultList[6] : [];

                    var jobTypeMap = [
                        'Full Time',
                        'Part Time',
                        'Work from Home',
                        'Internship',
                        'Apprenticeship',
                        'Job Oriented Training',
                        'Consultant',
                        'Freelancer'
                    ];

                    jobResultList[0][0].jobTypeList = [];

                    for(var i = 0; i < jobResultList[0].length; i++){
                        if(!isNaN(parseInt(jobResultList[0][i].jobType))){
                            jobResultList[0][0].jobTypeList.push({
                                jobTypeId : parseInt(jobResultList[0][i].jobType),
                                jobTypeTitle : jobTypeMap[jobResultList[0][i].jobType]
                            })
                        }
                    }

                    response.data = jobResultList[0];
                    res.status(200).json(response);

                }
                else{
                    response.status = false;
                    response.message = "Something went wrong ! Please try again later";
                    response.error = {};
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        else{
            res.status(401).json(response);
        }
    });
};

module.exports = SearchResumeCtrl;