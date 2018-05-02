/**
 * @author Indra Jeet
 * @description Controller for Quick Resume Registration Module Area Partner Project
 * @since July 1, 2016 04:42 PM IST
 */

var QuickResumeCtrl = {};

var gcloud = require('gcloud');
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey=appConfig.DB.secretKey;

var fs = require('fs');
var gm = require('gm').subClass({ imageMagick: true });
var uuid = require('node-uuid');

var gcs = gcloud.storage({
    projectId: appConfig.CONSTANT.GOOGLE_PROJECT_ID,
    keyFilename: appConfig.CONSTANT.GOOGLE_KEYFILE_PATH // Location to be changed
});
// Reference an existing bucket.
var bucket = gcs.bucket(appConfig.CONSTANT.STORAGE_BUCKET);
bucket.acl.default.add({
    entity: 'allUsers',
    role: gcs.acl.READER_ROLE
}, function (err, aclObject) {
});

// method for upload image to cloud
var uploadDocumentToCloud = function(uniqueName,readStream,callback){
    var remoteWriteStream = bucket.file(uniqueName).createWriteStream();
    readStream.pipe(remoteWriteStream);

    remoteWriteStream.on('finish', function(){
        console.log('done');
        if(callback){
            if(typeof(callback)== 'function'){
                callback(null);
            }
            else{
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else{
            console.log('callback is required for uploadDocumentToCloud');
        }
    });

    remoteWriteStream.on('error', function(err){
        if(callback){
            if(typeof(callback)== 'function'){
                console.log(err);
                callback(err);
            }
            else{
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else{
            console.log('callback is required for uploadDocumentToCloud');
        }
    });
};

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
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.q)
            ];
            /**
             * Calling search procedure to get candidate list based on email, phone or mobile number
             * @type {string}
             */
            var procQuery = 'CALL pSearch_CV( ' + procParams.join(',') + ')';
            console.log(procQuery);
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
                    console.log('searchResultList',searchResultList);
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

/**
 * Getting details of candidate according to master id
 * @param req
 * @param res
 * @param next
 * @service-param token
 * @service-param userId
 * @method GET
 */
QuickResumeCtrl.getResumeDetail = function(req,res,next){
    var response = {
        status : false,
        message : "Your session has expired please login to continue",
        data : [],
        error : {
            token : "Token is expired"
        }
    };

    if(!req.params.userId){
        response.status = false;
        response.message = "Invalid user id";
        response.error = {
            userId : "Invalid user id"
        };
        response.data = [];
        res.status(200).json(response);
        return;
    }
    req.st.validateTokenAp(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){
            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.params.userId),
                req.st.db.escape(DBSecretKey)
            ];

            var procQuery = 'CALL pGetCandidateDetailAP ( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, registrationResult) {
                console.log(registrationResult);
                //console.log(registrationResult[0]);

                if((!err) && registrationResult && registrationResult[0] && registrationResult[0][0]){
                    response.status = true;
                    response.message = "Candidate details loaded successfully";
                    response.error = null;

                    registrationResult[0][0].educationList = (registrationResult[1]) ? registrationResult[1] : [];
                    registrationResult[0][0].lineOfCareerList = (registrationResult[2]) ? registrationResult[2] : [];
                    registrationResult[0][0].preferredLocationList = (registrationResult[3]) ? registrationResult[3] : [];
                    registrationResult[0][0].languageList = (registrationResult[4]) ? registrationResult[4] : [];

                    var jobTypeList = (registrationResult[0][0].jobType) ?
                        registrationResult[0][0].jobType.split(',') : [];

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

                    registrationResult[0][0].jobTypeList = [];

                    for(var i = 0; i < jobTypeList.length; i++){
                        if(!isNaN(parseInt(jobTypeList))){
                            registrationResult[0][0].jobTypeList.push({
                                jobTypeId : parseInt(jobTypeList[i]),
                                jobTypeTitle : jobTypeMap[parseInt(jobTypeList[i])]
                            })
                        }
                    }
                    response.data = registrationResult[0];
                    res.status(200).json(response);

                }
                else{
                    console.error('err',err);
                    response.status = false;
                    response.message = "Inavlid user id";
                    response.error = null;
                    response.data = [];
                    res.status(500).json(response);
                }
            });
        }
        else{
            res.status(401).json(response);
        }
    });
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
            /**
             * setting default password and hashing it before saving it in database
             */
            var encryptPwd = (req.body.password) ? req.st.hashPassword(req.body.password) : req.st.hashPassword('123456');
            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(encryptPwd),
                req.st.db.escape(req.body.firstName),
                req.st.db.escape(req.body.lastName),
                req.st.db.escape(req.body.email),
                req.st.db.escape(req.body.isdMobile),
                req.st.db.escape(req.body.mobile),
                req.st.db.escape(req.body.isdPhone),
                req.st.db.escape(req.body.phone),
                req.st.db.escape(DBSecretKey)
            ];

            /**
             * Generating ezeoneId automatically
             */
            var procQuery = 'CALL pAutoGenerate_EzeoneId( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, registrationResult) {
                console.log(registrationResult);
                if((!err) && registrationResult && registrationResult[0] && registrationResult[0][0]){

                    /**
                     * If details of this person is already existing then it will not come as available
                     * and the details of the matching Id will be thrown to the Area Partner so that he can override the previous data
                     */
                    if (!registrationResult[0][0].isAvailable){
                        registrationResult[0][0].isAvailable = false;
                    }
                    else {
                        registrationResult[0][0].isAvailable = true;
                    }
                    if((!registrationResult[0][0].isAvailable) && registrationResult[1] && registrationResult[1][0]){
                        response.status = true;
                        response.message = "Than candidate already exists with the following details"
                        response.error = null;

                        registrationResult[1][0].educationList = registrationResult[2];
                        registrationResult[1][0].lineOfCareerList = registrationResult[3];
                        registrationResult[1][0].preferredLocationList = registrationResult[4];
                        registrationResult[1][0].languageList = registrationResult[5];

                        var jobTypeList = (registrationResult[1][0].jobType) ?
                            registrationResult[1][0].jobType.split(',') : [];

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
                        //registrationResult[0][0].isAvailable = true;
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
     * First call pAutoGenerate_EzeoneId
     * After that call pSave_Advanced_CV_Data
     * After this procedure call completes call in succession pSaveEducation, pSaveLoc and pSaveCVLocation
     */
        console.log(req.body.data);
        console.log('req.files',req.files);

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
            /**
             * serialize data is coming from front-end in data field because in same api maltipart data of profile image and resume
             * so parsing data to create json object
             */
            console.log('req.body.data',req.body);
            //console.log('replacedData',req.body.data.replace(/^\\$/g,""));

           //var data = JSON.parse(JSON.parse(req.body.data));
            var data = (typeof req.body.data == 'string') ? JSON.parse(req.body.data) : req.body.data;

            data.firstName = (data.firstName) ? data.firstName : '';
            data.lastName = (data.lastName) ? data.lastName : '';
            data.email = (data.email) ? data.email : '';
            data.isdMobile = (data.isdMobile) ? data.isdMobile : '';
            data.mobile = (data.mobile) ? data.mobile : '';
            data.isdPhone = (data.isdPhone) ? data.isdPhone : '';
            data.phone = (data.phone) ? data.phone : '';

            /**
             * setting default password and hashing it before saving it in database
             */
            var encryptPwd = (req.body.password) ? req.st.hashPassword(req.body.password) : req.st.hashPassword('123456');

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(encryptPwd),
                req.st.db.escape(data.firstName),
                req.st.db.escape(data.lastName),
                req.st.db.escape(data.email),
                req.st.db.escape(data.isdMobile),
                req.st.db.escape(data.mobile),
                req.st.db.escape(data.isdPhone),
                req.st.db.escape(data.phone),
                req.st.db.escape(DBSecretKey)
            ];

            /**
             * Generating ezeoneId automatically
             */
            var procQuery = 'CALL pAutoGenerate_EzeoneId( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, registrationResult) {
                //console.log(registrationResult);
                if((!err) && registrationResult && registrationResult[0] && registrationResult[0][0]){

                    /**
                     * checking condition for pictureFile and resumeFile if files ara there then uploading it to
                     * google cloud and saving url to databas else saving url given by user to database
                     */
                    var pictureFileName = '';
                    var tnPictureFileName = '';
                    var resumeFileName = '';

                    if(req.files && req.files.pictureFile){
                         var readStream = fs.createReadStream(req.files['pictureFile'].path);
                         var resizedReadStream = gm(req.files['pictureFile'].path).resize(100,100).autoOrient().quality(0).stream(req.files['pictureFile'].extension);
                         pictureFileName = uuid.v4() + ((req.files['pictureFile'].extension) ? ('.' + req.files['pictureFile'].extension) : 'jpg');
                         tnPictureFileName = "tn_" + pictureFileName;
                         uploadDocumentToCloud(pictureFileName, readStream, function (err) {
                             if (!err) {
                                 uploadDocumentToCloud(tnPictureFileName, resizedReadStream, function (err) {
                                     if (!err) {
                                         console.log(tnPictureFileName);
                                         deleteTempFile(req.files['pictureFile'].path);
                                         console.log('Picture file uploaded succesfully');
                                     }
                                     else {
                                         deleteTempFile(req.files['pictureFile'].path);
                                         console.log('Error while saving thumbnail picture file');
                                     }
                                 });
                             }
                             else {
                                 deleteTempFile(req.files['pictureFile'].path);
                                 console.log('Error while saving thumbnail picture file');
                             }
                         });
                     }
                     else {
                         pictureFileName = (data.pictureLink) ? data.pictureLink : '';
                     }

                    if(req.files.resumeFile){
                        var readStream = fs.createReadStream(req.files['resumeFile'].path);
                        resumeFileName = uuid.v4() + ((req.files['resumeFile'].extension) ? ('.' + req.files['resumeFile'].extension) : 'docx');
                        uploadDocumentToCloud(resumeFileName, readStream, function (err) {
                            if (!err) {
                                deleteTempFile(req.files['resumeFile'].path);
                                console.log('Resume saved successfully');
                            }
                            else {
                                deleteTempFile(req.files['resumeFile'].path);
                                console.log('Error while saving resume');
                            }
                        });
                    }
                    else {
                        resumeFileName = (data.resumeAttachmentLink) ? data.resumeAttachmentLink : '';
                    }
                    /**
                     * to delete files from local storage
                     */
                    var deleteTempFile = function(localFilePath){
                        fs.unlink('../bin/'+ localFilePath, function(err){
                            if (!err){
                                console.log('Temporary file deleted successfully');
                            }
                            else {
                                console.error('Error in removing temporary file',err);
                                return;
                            }
                        });
                    };

                    /**
                     * If details of this person is already existing then it will not come as available
                     * and the details of the matching Id will be thrown to the Area Partner so that he can override the previous data
                     */
                        var educationList = (data.educationList) ? data.educationList : [];
                        var jobTypeList = (data.jobTypeList) ? data.jobTypeList : [0];
                        var lineOfCareerList = (data.lineOfCareerList) ? data.lineOfCareerList : [];
                        var preferredLocationList = (data.preferredLocationList) ? data.preferredLocationList : [];
                        var languageList = (data.languageList) ? data.languageList : [];


                    /**
                     *  Array of multiple object will come for job type from front-end
                     *  have to convert it in comma separated id's to send in db
                     *  first creating array of job type id's then converting it in comma seprated string
                     */

                    var jobTypeArray = [];
                    console.log('jobTypeList.length',jobTypeList.length);
                    console.log('jobTypeList',jobTypeList);
                    for (var a = 0; a < jobTypeList.length; a++ ){
                        jobTypeArray.push(jobTypeList[a].jobTypeId);
                    }
                    var jobType = jobTypeArray.join(',');

                    /**
                     * calling procidure to save basic information of candidate
                     * @type {*[]}
                     */
                    data.experience = (data.experience) ? data.experience : 0.00;
                    data.dateOfBirth = (data.dateOfBirth) ? data.dateOfBirth : null;
                    data.gender = (data.gender) ? data.gender : 0;
                    data.maritalStatus = (data.maritalStatus) ? data.maritalStatus : 0;
                    data.address = (data.address) ? data.address : '';
                    data.latitude = (data.latitude) ? data.latitude : null;
                    data.longitude = (data.longitude) ? data.longitude : null;
                    data.rating = (data.rating) ? data.rating : 0;
                    data.presentSalary = (data.presentSalary) ? data.presentSalary : 0;
                    data.presentSalaryType = (data.presentSalaryType) ? data.presentSalaryType : 0;
                    data.expectedSalary = (data.expectedSalary) ? data.expectedSalary : 0;
                    data.expectedSalaryType = (data.expectedSalaryType) ? data.expectedSalaryType : 0;
                    data.noticePeriod = (data.noticePeriod) ? data.noticePeriod : 0;
                    data.currentEmployer = (data.currentEmployer) ? data.currentEmployer : '';
                    data.aboutCandidate = (data.aboutCandidate) ? data.aboutCandidate : '';
                    data.availableForJobFlag = (data.availableForJobFlag) ? data.availableForJobFlag : 0;
                    data.availableForJobAfter = (data.availableForJobAfter) ? data.availableForJobAfter : "2012-01-01";

                    var procAdvanceParam = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(registrationResult[0][0].tid),
                        req.st.db.escape(data.firstName),
                        req.st.db.escape(data.lastName),
                        req.st.db.escape(data.email),
                        req.st.db.escape(data.isdMobile),
                        req.st.db.escape(data.mobile),
                        req.st.db.escape(data.isdPhone),
                        req.st.db.escape(data.phone),
                        req.st.db.escape(data.dateOfBirth),
                        req.st.db.escape(data.gender),
                        req.st.db.escape(data.maritalStatus),
                        req.st.db.escape(data.address),
                        req.st.db.escape(data.latitude),
                        req.st.db.escape(data.longitude),
                        req.st.db.escape(data.rating),
                        req.st.db.escape(data.experience),
                        req.st.db.escape(data.presentSalary),
                        req.st.db.escape(data.presentSalaryType),
                        req.st.db.escape(data.expectedSalary),
                        req.st.db.escape(data.expectedSalaryType),
                        req.st.db.escape(data.noticePeriod),
                        req.st.db.escape(data.currentEmployer),
                        req.st.db.escape(data.aboutCandidate),
                        req.st.db.escape(data.availableForJobFlag),
                        req.st.db.escape(pictureFileName),
                        req.st.db.escape(jobType),
                        req.st.db.escape(data.availableForJobAfter),
                        req.st.db.escape(resumeFileName)
                    ];
                    var procAdvanceQuery = 'CALL pSave_Advanced_CV_Data (' + procAdvanceParam.join(',') + ')';
                    console.log(procAdvanceQuery);
                    req.db.query(procAdvanceQuery, function (err, advanceDataResult) {
                        console.log(advanceDataResult);
                        if (!err && advanceDataResult && advanceDataResult[0] && advanceDataResult[0][0]
                            && advanceDataResult[0][0].tid){
                            var bigCombQuery = '';
                            var educationQuery = '';
                            var locQuery = '';
                            var locationQuery = '';
                            var languageQuery = '';
                            /**
                             * Preparing query to save multiple educations of candidate
                             * for the following param sending default value because no need of these param for this api
                             * Score  {int} default 0
                             * Yearofpassing {int}  default 0
                             * Level {int}   default 0,
                             * Instituteid {int}  default 0
                             * University_reg_no  {varchar} default empty string
                             */
                            for (var i = 0; i < educationList.length; i++ ){
                                if (parseInt(educationList[i].educationId) != 0 && parseInt(educationList[i].specializationId) != 0){
                                    var procEducationParam = [
                                        req.st.db.escape(advanceDataResult[0][0].cvId),
                                        req.st.db.escape(educationList[i].educationId),
                                        req.st.db.escape(educationList[i].specializationId),
                                        req.st.db.escape(educationList[i].score),
                                        req.st.db.escape(educationList[i].yearOfPassing),
                                        req.st.db.escape(0),
                                        req.st.db.escape(educationList[i].instituteId),
                                        req.st.db.escape('')
                                    ];
                                    educationQuery += 'CALL psavecveducation(' + procEducationParam.join(',') + ');';
                                }
                            }
                            /**
                             * Preparing query to save multiple line of career of candidate
                             * for the following param sending default value because no need of these param for this api
                             * Functionid {int}   default 0
                             * Level {int} default 0
                             * Exp  {decimal} default 0
                             * Uid   {varchar} default  empty string
                             */
                            for (var j = 0; j < lineOfCareerList.length; j++){
                                if (parseInt(lineOfCareerList[j].locId) != 0){
                                    var procLOCParam = [
                                        req.st.db.escape(0),
                                        req.st.db.escape(lineOfCareerList[j].tid),
                                        req.st.db.escape(0),
                                        req.st.db.escape(0),
                                        req.st.db.escape(advanceDataResult[0][0].cvId),
                                        req.st.db.escape('')
                                    ];
                                    locQuery += 'CALL psavecvLOC(' + procLOCParam.join(',') + ');';
                                }
                            }
                            /**
                             * Preparing query to save multiple location of candidate
                             */
                            for (var k = 0; k < preferredLocationList.length; k++){
                                if (parseInt(preferredLocationList[k].title) != ''){
                                    var procLoctionParam = [
                                        req.st.db.escape(advanceDataResult[0][0].cvId),
                                        req.st.db.escape(preferredLocationList[k].title),
                                        req.st.db.escape(preferredLocationList[k].latitude),
                                        req.st.db.escape(preferredLocationList[k].longitude)
                                    ];
                                    locationQuery += 'CALL psavecvlocation(' + procLoctionParam.join(',') + ');';
                                }
                            }
                            /**
                             * Preparing query to save multiple language of candidate
                             */
                            for (var l = 0; l < languageList.length; l++){
                                if (parseInt(languageList[l].languageId) != 0 ){
                                    if (parseInt(languageList[l].readLevel) != 0 || parseInt(languageList[l].writeLevel) != 0){
                                        var procLanguageParam = [
                                            req.st.db.escape(advanceDataResult[0][0].cvId),
                                            req.st.db.escape(languageList[l].languageId),
                                            req.st.db.escape(languageList[l].readLevel),
                                            req.st.db.escape(languageList[l].writeLevel)
                                        ];
                                        languageQuery += 'CALL psavecvlanguage (' + procLanguageParam.join(',') + ');';
                                    }
                                }
                            }
                            bigCombQuery = educationQuery + locQuery + locationQuery + languageQuery;
                            console.log('bigCombQuery',bigCombQuery);
                            req.db.query(bigCombQuery, function (err, resumeResult) {
                                if (!err && resumeResult){
                                    response.status = true;
                                    response.message = "Candidate details saved successfully";
                                    response.error = null;
                                    response.data = {
                                        tid : advanceDataResult[0][0].tid,
                                        localRecordId : data.localRecordId,
                                        ezeoneId : registrationResult[0][0].ezeoneId

                                    };
                                    console.log("response",response);
                                    res.status(200).json(response);
                                }
                                else {
                                    response.status = true;
                                    response.message = "Candidate details saved successfully";
                                    response.error = null;
                                    response.data = {
                                        tid : advanceDataResult[0][0].tid,
                                        localRecordId : data.localRecordId,
                                        ezeoneId : registrationResult[0][0].ezeoneId

                                    };
                                    console.log("response",response);
                                    res.status(200).json(response);
                                }
                            });
                        }
                        else {
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
                else {
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