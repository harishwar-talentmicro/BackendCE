/**
 * @author Indra Jeet
 * @description Controller for Quick Resume Registration Module Area Partner Project
 * @since July 1, 2016 04:42 PM IST
 */

var QuickResumeCtrl = {};

/**
 * Searching candidates based on email, mobile or phone number by Area Partner
 * @param req
 * @param res
 * @param next
 * @service-param q {string)
 * @method GET
 */
QuickResumeCtrl.searchCandidate = function(req,res,next){
    var response = {
        status : false,
        message : "Your session has expired please login to continue",
        data : null,
        error : {
            token : "Token is expired"
        }
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
             * Calling search procedure to get candidate list based on email, phone or mobile number
             * @type {string}
             */
            var procQuery = 'CALL pSearch_CV( ' + procParams.join(',') + ')';
            req.db.query(procQuery,function(err,searchResultList){
                if(err){
                    response.status = false;
                    response.message = "Something went wrong ! Please try again later";
                    response.error = {
                        q : "Internal Server Error"
                    };
                    response.data = null;
                    res.status(500).json(response);
                }
                else{
                    response.status = true;
                    response.message = "Search results loaded successfully";
                    response.error = null;
                    response.data = (searchResultList && searchResultList[0]) ? searchResultList[0] : []
                    res.status(200).json(response);
                }
            });
        }
        else{
            res.status(401).json(response);
        }
    });
};

QuickResumeCtrl.getResumeDetail = function(req,res,next){
    
};


/**
 * Getting all options of fields related to resume which user will get at the time of saving resume
 * @method GET
 * @param req
 * @param res
 * @param next
 * @service-param q {string)
 *
 */
QuickResumeCtrl.getMasterDetail = function(req,res,next){
    var response = {
        status : false,
        message : "Your session has expired please login to continue",
        data : null,
        error : {
            token : "Token is expired"
        }
    };
    var error = {};
    try {

        var jobTypeOutput = [];
        var specializationOutput = [];
        /**
         * creating jobTypeList from array of job type
         * @type {string[]}
         */

        var jobType = [
            'Full Time',
            'Part Time',
            'Work from Home',
            'Internship',
            'Apprenticeship',
            'Job Oriented Training',
            'Consultant',
            'Freelancer'
        ];
        for (var m = 0; m < jobType.length; m++){
            jobObject = {};
            jobObject.jobTypeId = m;
            jobObject.jobTypeTitle = jobType[m];
            jobTypeOutput.push(jobObject);
        }
        /**
         * validating token
         * */
        /**
         * to get all available results education id and loc id passing as 0
         * @type {string}
         */

        req.st.validateTokenAp(req.query.token, function (err, tokenResult) {
            if (!err) {
                if (tokenResult) {
                    var locationParams = req.db.escape(req.query.token);
                    /**
                     * to get all available results education id and loc id passing as 0
                     * @type {string}
                     */
                    var query = 'CALL pGetEducations('+ 0 +'); CALL pgetcitys_ap('+ locationParams +');CALL pgetLOC('+ 0 +');'
                    req.db.query(query, function (err, results) {
                        if (!err) {
                            if (results && results[0] && results[0].length > 0) {

                                /**
                                 * preparing query to get all specialisation of education id
                                 * after that making object for multiple specialization for multiple education
                                 * @type {string}
                                 */
                                var specializationQuery = '';
                                for (var i = 0; i < results[0].length; i++){
                                    var specialisationParams = req.db.escape(results[0][i].TID);
                                    specializationQuery += "CALL pGetSpecialization("+ specialisationParams +");"
                                }
                                var outputSpecialiszation = [];
                                req.db.query(specializationQuery, function (err, specializationResult) {
                                    if (!err) {
                                        if (specializationResult && specializationResult.length) {
                                            for(var j = 0; j < specializationResult.length/2; j++){
                                                for (var k = 0; k < specializationResult[j*2].length; k++){
                                                    var result = {};
                                                    result.tid = specializationResult[j*2][k].TID;
                                                    result.title = specializationResult[j*2][k].Title;
                                                    result.educationId = results[0][j].TID;
                                                    outputSpecialiszation.push(result);
                                                }
                                            }
                                            console.log(outputSpecialiszation);
                                            response.status = true;
                                            response.data = {
                                                educationList : results[0],
                                                educationSplList : outputSpecialiszation,
                                                jobTypeList : jobTypeOutput,
                                                preferredLocationList : results[2],
                                                lineOfCareerList : results[4]
                                            };
                                            response.error = null;
                                            response.message = 'Template list loaded successfully';
                                            res.status(200).json(response);
                                        }
                                        else {
                                            console.log('Error while getting specialization');
                                            response.status = true;
                                            response.data = {
                                                educationList : results[0],
                                                educationSplList : outputSpecialiszation,
                                                jobTypeList : jobTypeOutput,
                                                preferredLocationList : results[2],
                                                lineOfCareerList : results[4]
                                            };
                                            response.error = null;
                                            response.message = 'Template list loaded successfully';
                                            res.status(200).json(response);
                                        }
                                    }
                                    else {
                                        response.status = true;
                                        response.data = {
                                            educationList : results[0],
                                            educationSplList : outputSpecialiszation,
                                            jobTypeList : jobTypeOutput,
                                            preferredLocationList : results[2],
                                            lineOfCareerList : results[4]
                                        };
                                        response.error = null;
                                        response.message = 'Template list loaded successfully';
                                        res.status(200).json(response);

                                        console.log('Error while getting specialization');
                                        console.log(err);
                                    }
                                });
                            }
                            else {
                                response.message = 'Template list are not available';
                                res.json(response);
                            }

                        }
                        else {
                            response.data = null;
                            response.message = 'Error in getting Holiday template List';
                            console.log('Pget_holiday_template_list: Error in getting Template List' + err);
                            res.status(500).json(response);
                        }
                    });
                }
                else {
                    response.message = 'Invalid token';
                    response.error = {
                        token: 'Invalid Token'
                    };
                    response.data = null;
                    res.status(401).json(response);
                    console.log('Pget_holiday_template_list: Invalid token');
                }
            }
            else {
                response.error = {
                    server: 'Internal Server Error'
                };
                response.message = 'Error in validating Token';
                res.status(500).json(response);
                console.log('Pget_holiday_template_list:Error in processing Token' + err);
            }
        });
    }
    catch (ex) {
        response.error = {};
        response.message = 'An error occured !';
        console.log('Pget_holiday_template_list:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(response);
    }
};

QuickResumeCtrl.checkCandidate = function(req,res,next){
    var response = {
        status : false,
        message : "Your session has expired please login to continue",
        data : null,
        error : {
            token : "Token is expired"
        }
    };

    req.st.validateTokenAp(req.query.token,function(err,tokenResult) {
        if ((!err) && tokenResult) {
            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.body.password),
                req.st.db.escape(req.body.firstName),
                req.st.db.escape(req.body.lastName),
                req.st.db.escape(req.body.email),
                req.st.db.escape(req.body.isdMobile),
                req.st.db.escape(req.body.mobile),
                req.st.db.escape(req.body.isdPhone),
                req.st.db.escape(req.body.phone)
            ];

            /**
             * Generating ezeoneId automatically
             */
            var procQuery = 'CALL pAutoGenerate_EzeoneId( ' + procParams.join(',') + ')';
            req.db.query(procQuery, function (err, registrationResult) {
                if((!err) && registrationResult && registrationResult[0] && registrationResult[0][0]){

                    /**
                     * If details of this person is already existing then it will not come as available
                     * and the details of the matching Id will be thrown to the Area Partner so that he can override the previous data
                     */

                    if((!registrationResult[0][0].isAvailable) && registrationResult[1] && registrationResult[1][0]){
                        response.status = true;
                        response.message = "Than candidate already exists with the following details"
                        response.error = null;

                        registrationResult[1][0].educationList = registrationResult[2];
                        registrationResult[1][0].lineOfCareerList = registrationResult[3];
                        registrationResult[1][0].preferredLocationList = registrationResult[4];

                        var jobTypeList = (registrationResult[1][0].jobType) ?
                            registrationResult[1][0].jobType.split('') : [];

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

                        registrationResult[1][0].jobTypeList = [];

                        for(var i = 0; i < jobTypeList.length; i++){
                            if(!isNaN(parseInt(jobTypeList))){
                                registrationResult[1][0].jobTypeList.push({
                                    jobTypeId : parseInt(jobTypeList[i]),
                                    jobTypeTitle : jobTypeMap[parseInt(jobTypeList[i])]
                                })
                            }
                        }

                        registrationResult[0][0].userResult = [registrationResult[1][0]];

                        response.data = registrationResult[0][0];
                        res.status(200).json(response);
                    }
                    else{
                        response.status = true;
                        response.message = "EZEOne ID is generated successfully for the user. Please proceed by filling more details"
                        response.error = null;
                        /**
                         * If EZEOne ID is generated successfully then sending the EZEOne ID and TID for further details saving
                         */

                        registrationResult[0][0].userResult = [];
                        response.data = registrationResult[0][0];
                        res.status(200).json(response);
                    }
                }
                else{
                    console.log('err',err);
                    response.status = false;
                    response.message = "Something went wrong ! Please try again later";
                    response.error = {
                        q: "Internal Server Error"
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
 * Saving resume by area partner with offline support capability in Android application
 * EZEOne ID is autogenerated and if previous ID is present with same data eg. firstName, mobileNumber, phone or email
 * then that data is overrided by new data and a log entry is made into another table
 * @param req
 * @param res
 * @param next
 * @service-param token {string}
 * @service-data {*} (Resume Object containing various fields)
 */

QuickResumeCtrl.saveResumeDetail = function(req,res,next){
    /**
     * @TODO
     * First call pAutoGenerate_EzeoneId
     * After that call pSave_Advanced_CV_Data
     * After this procedure call completes call in succession pSaveEducation, pSaveLoc and pSaveCVLocation
     */
    var response = {
        status : false,
        message : "Your session has expired please login to continue",
        data : null,
        error : {
            token : "Token is expired"
        }
    };

    req.st.validateTokenAp(req.query.token,function(err,tokenResult) {
        if ((!err) && tokenResult) {
            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.body.password),
                req.st.db.escape(req.body.firstName),
                req.st.db.escape(req.body.lastName),
                req.st.db.escape(req.body.email),
                req.st.db.escape(req.body.isdMobile),
                req.st.db.escape(req.body.mobile),
                req.st.db.escape(req.body.isdPhone),
                req.st.db.escape(req.body.phone)
            ];

            /**
             * Generating ezeoneId automatically
             */
            var procQuery = 'CALL pAutoGenerate_EzeoneId( ' + procParams.join(',') + ')';
            req.db.query(procQuery, function (err, registrationResult) {
                if((!err) && registrationResult && registrationResult[0] && registrationResult[0][0]){

                    /**
                     * If details of this person is already existing then it will not come as available
                     * and the details of the matching Id will be thrown to the Area Partner so that he can override the previous data
                     * @TODO Please save extra details of the user
                     */

                    if((!registrationResult[0][0].isAvailable) && registrationResult[1] && registrationResult[1][0]){
                        response.status = true;
                        response.message = "Than candidate already exists with the following details"
                        response.error = null;

                        registrationResult[1][0].educationList = registrationResult[2];
                        registrationResult[1][0].lineOfCareerList = registrationResult[3];
                        registrationResult[1][0].preferredLocationList = registrationResult[4];

                        var jobTypeList = (registrationResult[1][0].jobType) ?
                            registrationResult[1][0].jobType.split('') : [];

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

                        registrationResult[1][0].jobTypeList = [];

                        for(var i = 0; i < jobTypeList.length; i++){
                            if(!isNaN(parseInt(jobTypeList))){
                                registrationResult[1][0].jobTypeList.push({
                                    jobTypeId : parseInt(jobTypeList[i]),
                                    jobTypeTitle : jobTypeMap[parseInt(jobTypeList[i])]
                                })
                            }
                        }

                        registrationResult[0][0].userResult = [registrationResult[1][0]];

                        response.data = registrationResult[0][0];
                        res.status(200).json(response);
                    }
                    else{
                        response.status = true;
                        response.message = "EZEOne ID is generated successfully for the user. Please proceed by filling more details"
                        response.error = null;
                        /**
                         * If EZEOne ID is generated successfully then sending the EZEOne ID and TID for further details saving
                         */

                        registrationResult[0][0].userResult = [];
                        response.data = registrationResult[0][0];
                        res.status(200).json(response);
                    }
                }
                else{
                    console.log('err',err);
                    response.status = false;
                    response.message = "Something went wrong ! Please try again later";
                    response.error = {
                        q: "Internal Server Error"
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

module.exports = QuickResumeCtrl;