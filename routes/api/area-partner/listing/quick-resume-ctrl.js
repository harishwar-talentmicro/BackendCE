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