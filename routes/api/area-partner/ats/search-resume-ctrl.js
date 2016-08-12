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

            req.query.isAreaPartner = (req.query.isAreaPartner) ? req.query.isAreaPartner : 1;
            var procParams = [
                req.st.db.escape(req.query.q),req.st.db.escape(req.query.isAreaPartner)
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

    if(!req.params.jobId){
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
                req.st.db.escape(req.params.jobId),

                req.st.db.escape(req.query.token)
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

                    jobResultList[0][0].educationList = (jobResultList[3]) ? jobResultList[3] : [];
                    jobResultList[0][0].lineOfCareerList = (jobResultList[2]) ? jobResultList[2] : [];
                    jobResultList[0][0].preferredLocationList = (jobResultList[1]) ? jobResultList[1] : [];
                    jobResultList[0][0].languageList = (jobResultList[4]) ? jobResultList[4] : [];

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

                    delete jobResultList[0][0].jobType;
                    response.data = jobResultList[0][0];
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

/**
 * searching resume matching to given details
 * @param req
 * @param res
 * @param next
 */
SearchResumeCtrl.searchResume = function(req,res,next){
    var token = req.query.token;

    var source = (req.body.source) ? req.body.source : "1,2";
    var skillKeywordsList = (req.body.skillKeywords) ? (" +" + req.body.skillKeywords).split(',') : [];

    var skillKeywordsQueryParts = [];
    if(skillKeywordsList.length){
        skillKeywordsQueryParts.push(" and MATCH (tcv.KeySkills,tcv.lockeywords,tcv.searchFields) AGAINST ("
            + req.db.escape(skillKeywordsList.join(' +')) + "  IN BOOLEAN MODE ) ");
    }
    //var skillKeywords = "";
    var limit = req.body.limit;
    //var start = req.body.pageNumber;
   var start =  ((((req.body.pageNumber) * limit) + 1) - limit)-1;


    //age params
    var ageFrom=req.body.ageFrom;
    var ageTo=req.body.ageTo;


    var gender = req.body.gender;

    //gender = (gender == 2) ? "0,1,2" : ((gender) ? ""+gender+ "": "0,1,2");
    gender = (req.body.gender) ? (req.body.gender).join(',') : '';
    var source1GenderQuery = " AND FIND_IN_SET(m.Gender,"+req.db.escape(gender)+") ";

    var expQuery = '';
    var salQuery  = '';
    var expectedSalQuery  = '';
    var instituteQuery = '';
    var eduMatrixArray = [];
    var eduMatrix = '';
    var edujoin = '';
    var locMatrixArray = [];
    var locQuery = '';
    var locjoin = '';
    var langMatrixArray = [];
    var langdata = '';
    var langjoin = '';

    if(req.body.experienceFrom && req.body.experienceTo){
        expQuery = " AND tcv.Exp>=" + req.db.escape(req.body.experienceFrom) + "AND tcv.Exp <= " + req.db.escape(req.body.experienceTo);
    }
    /**
     * converting salary to annual bases
     */
    if (req.body.presentSalaryFrom && req.body.presentSalaryTo){
        if (parseInt(req.body.presentSalaryType) == 1){
            req.body.presentSalaryFrom = Math.round( (req.body.presentSalaryFrom) * 2112.00) ;
            req.body.presentSalaryTo = Math.round( (req.body.presentSalaryTo) * 2112.00 );
        }
        if (parseInt(req.body.presentSalaryType) == 2){
            req.body.presentSalaryFrom = Math.round( ((req.body.presentSalaryFrom) * 2112.00)/176);
            req.body.presentSalaryTo = Math.round( ((req.body.presentSalaryTo) * 2112.00)/176) ;
        }
        salQuery = " AND tcv.salary >= " + req.db.escape(req.body.presentSalaryFrom)+ " AND tcv.salary <="
            +req.db.escape(req.body.presentSalaryTo);
    }
    //expected salary
    if (req.body.expectedSalaryFrom && req.body.expectedSalaryTo){
        if (parseInt(req.body.expectedSalaryType) == 1){
            req.body.expectedSalaryFrom = Math.round( (req.body.expectedSalaryFrom) * 2112.00) ;
            req.body.expectedSalaryTo = Math.round( (req.body.expectedSalaryTo) * 2112.00 );
        }
        if (parseInt(req.body.expectedSalaryType) == 2){
            req.body.expectedSalaryFrom = Math.round( ((req.body.expectedSalaryFrom) * 2112.00)/176);
            req.body.expectedSalaryTo = Math.round( ((req.body.expectedSalaryTo) * 2112.00)/176) ;
        }
        expectedSalQuery = " AND tcv.exp_salary >= " + req.db.escape(req.body.expectedSalaryFrom)+ " AND tcv.exp_salary <="
            +req.db.escape(req.body.expectedSalaryTo);
    }


    /**
     * to prepare query for location have to call psavejoblocation
     * this will give id's. With these id's we have preapre query
     */

    var locationQuery = '';
    var locationIdArray = [];
    var locationId = '';
    var locationList = (req.body.locationList) ? req.body.locationList : [];

    /**
     * preparing query for jobtype
     */
    var jobTypeQuery = '';
    var jobTypeList = (req.body.jobTypeList) ? req.body.jobTypeList : [];
    if (jobTypeList && jobTypeList.length){
     for ( var z = 0; z < jobTypeList.length; z++){
         if (jobTypeQuery == ''){
             jobTypeQuery = ' tcv.jobtype ='+ jobTypeList[z].jobTypeId;
         }
         else {
             jobTypeQuery = jobTypeQuery + ' OR ' + 'tcv.jobtype =' + jobTypeList[z].jobTypeId;
         }
     }
        jobTypeQuery = ' AND (' +jobTypeQuery +') ' ;

    }

    /**
     * preparing query for education
     */
    var educations = (req.body.educationList) ? req.body.educationList : [];
    if (educations){
        if (educations.length > 0){
            for ( var j = 0; j < educations.length; j++){
                var educationStr = '';
                var spcStr = '';
                var scoreStr = '';
                var yopStr = '';
                var instituteStr='';
                var fullStr='';

                var eduSkills = {
                    education: (educations[j].educationId) ? educations[j].educationId.toString() : '',
                    spc: educations[j].specializationId ? educations[j].specializationId.toString() : '',
                    scoreFrom: educations[j].scoreFrom ? educations[j].scoreFrom.toString() : 0,
                    scoreTo: educations[j].scoreTo ? educations[j].scoreTo.toString() : 0,
                    yearOfPassingFrom: educations[j].yearOfPassingFrom ? educations[j].yearOfPassingFrom.toString() : '',
                    yearOfPassingTo: educations[j].yearOfPassingTo ? educations[j].yearOfPassingTo.toString() : '',
                    instituteId: educations[j].instituteId ? educations[j].instituteId.toString() : 0

                };
                if(eduSkills.education) {
                    educationStr = ' edu.Educationid=' + req.db.escape(eduSkills.education) ;
                }
                if(eduSkills.spc && eduSkills.spc!="0") {
                    spcStr = ' AND edu.Specializationids=' + req.db.escape(eduSkills.spc) ;
                }
                if(eduSkills.scoreTo) {
                    scoreStr=' AND edu.Score>=' + req.db.escape(eduSkills.scoreFrom) +
                        ' AND edu.Score<=' + req.db.escape(eduSkills.scoreTo) ;
                }
                if(eduSkills.yearOfPassingTo && eduSkills.yearOfPassingTo!="0") {
                    yopStr=' AND edu.yearofpassing>=' + req.db.escape(eduSkills.yearOfPassingFrom) +
                        ' AND edu.yearofpassing<=' + req.db.escape(eduSkills.yearOfPassingTo) ;
                }
                if(eduSkills.instituteId) {
                    instituteStr=' and edu.Instituteid=' + req.db.escape(eduSkills.instituteId) ;
                }
                fullStr='(' + educationStr + spcStr + scoreStr + yopStr + instituteStr + ')';
                console.log("fullStr",fullStr);

                eduMatrixArray.push(fullStr);

            }
            eduMatrix += (eduMatrixArray.length) ? " AND ( "+ eduMatrixArray.join(" OR ") +") " : "";
            eduMatrix=eduMatrix.replace('  ',' ').replace('and and',' and ').replace('AND ( AND',' AND ( ').replace(
                'AND ( ( AND',' AND (( ');
            console.log('eduMatrixArray',eduMatrix);

            edujoin = ' LEFT OUTER JOIN tcv_education edu ON edu.cvid=tcv.tid ';
        }
    }
    /**
     * preparing query for Line of career
     */
    var locMatrix = (req.body.lineOfCareerList) ? req.body.lineOfCareerList : [];
    if (locMatrix){
        if (locMatrix.length > 0){
            for ( var k = 0; k < locMatrix.length; k++){
                if (locQuery == ''){
                    locQuery = 'loc.LOCid=' + locMatrix[k].locId;
                }
                else {
                    locQuery = locQuery + ' OR ' + 'loc.LOCid=' + locMatrix[k].locId;
                }


            }
            locQuery = ' AND (' +locQuery +') ' ;
            locjoin = ' LEFT OUTER JOIN tcv_loc loc ON loc.cvid=tcv.tid ';
        }
    }
    /**
     * preparing query for Languages
     */
    var languageMatrix = (req.body.languageList) ? req.body.languageList : [];
    if (languageMatrix){
        if (languageMatrix.length > 0){
            for ( var m = 0; m < languageMatrix.length; m++){
                var langParam = {
                    langId: languageMatrix[m].languageId ? languageMatrix[m].languageId.toString() : '',
                    readLevelFrom: languageMatrix[m].readLevelFrom ? languageMatrix[m].readLevelFrom.toString() : 0,
                    readLevelTo: languageMatrix[m].readLevelTo ? languageMatrix[m].readLevelTo.toString() : 0,
                    writeLevelFrom: languageMatrix[m].writeLevelFrom ? languageMatrix[m].writeLevelFrom.toString() : 0,
                    writeLevelTo: languageMatrix[m].writeLevelTo ? languageMatrix[m].writeLevelTo.toString() : 0

                };
                langMatrixArray.push(' (FIND_IN_SET(lang.langid,' + req.db.escape(langParam.langId) + ')'   +
                    ' AND lang.level>=' + req.db.escape(langParam.readLevelFrom) + '  AND lang.level<=' +
                    req.db.escape(langParam.readLevelTo) + ' AND lang.writeLevel>=' + req.db.escape(langParam.writeLevelFrom)
                    + ' AND lang.writeLevel<=' + req.db.escape(langParam.writeLevelTo) + ' )');
            }
            langdata += (langMatrixArray.length) ? " AND ( "+ langMatrixArray.join(" OR ") +")" : "";
            langjoin = ' LEFT OUTER JOIN tcv_language lang ON lang.cvid=tcv.tid ';
        }
    }
    /**
     * checking condition for status (hidden or visible)
     */

    var filterQuery = '';
    var status;
    var filterQuery1='';

    var masterID = "SET @masterid = (SELECT tid FROM tapuser WHERE token =" +req.db.escape(token)+");";
    req.body.showHiddenApplicantsFlag = (req.body.showHiddenApplicantsFlag) ? req.body.showHiddenApplicantsFlag : 0;
    if (parseInt(req.body.showHiddenApplicantsFlag) == 0){
        filterQuery = " AND NOT FIND_IN_SET(tcv.tid,ifnull((SELECT GROUP_CONCAT(cvid) FROM tapplicant_hidden WHERE apuser_id="
            + '@masterID' +  "),''))";
        status = "," + 1 +" as status";
    }
    else if (parseInt(req.body.showHiddenApplicantsFlag) == 1){
        filterQuery1 = " left outer join tapplicant_hidden z on z.cvid=tcv.tid";
        filterQuery = " or z.cvid=tcv.tid";
        status = " ,if(z.tid is null," + 1 + "," + 0 + ") as status";
    }
    else {
        filterQuery = " AND FIND_IN_SET(tcv.tid,ifnull((SELECT GROUP_CONCAT(cvid) FROM tapplicant_hidden WHERE apuser_id="
            + '@masterID' +  "),''))";
        status = ","+ 0 + " as status";
    }

    /**
     * checking condition for notice period, rating and marital status
     */
    var noticePeriodQuery = '';
    var ratingQuery = '';
    var maritalStatusQuery = '';
    var locationData = '';
    var locationJoin = '';
    var distanceQuery = ' 0 as distance ';


    if (parseInt(req.body.noticePeriodTo) != 0){
        noticePeriodQuery = ' and tcv.noticeperiod>='+req.db.escape(req.body.noticePeriodFrom) +' and tcv.noticeperiod<='+
            req.db.escape(req.body.noticePeriodTo);
    }
    var rating = (req.body.rating) ? req.body.rating.join(',') : '';
    if (rating){
        ratingQuery = ' and find_in_set(m.Rating,'+ req.db.escape(rating)+')';
    }

    var maritalStatus = (req.body.maritalStatus) ? req.body.maritalStatus.join(',') : '';

    if (maritalStatus){
        maritalStatusQuery = ' and find_in_set(m.maritalStatus,'+ req.db.escape(maritalStatus)+')';
    }

    /**
     * concatenating all above prepared query
     */

    /**
     * @login_tid TID of a user who is logged in (from tmaster)
     */
    var jobSeekerQuery ="";
    //    "SET @user_ids = (SELECT get_account_users("+req.db.escape(token)+"));";
    //jobSeekerQuery+=masterID;


    var apUserCvs='';
    var sourceQry='';

    apUserCvs=' and m.apuserid!=0 and tcv.OID=0 and tcv.jobid=0 ';
        var ageQuery='';
        if(ageTo) {
            ageQuery=' and ifnull((timestampdiff(YEAR,m.DOB,UTC_TIMESTAMP())),0)>=' + req.db.escape(ageFrom) +
                ' and ifnull((timestampdiff(YEAR,m.DOB,UTC_TIMESTAMP())),0)<=' + req.db.escape(ageTo) ;
        }
    var locList = [];
    var preparedQuery = function (){
        var subQuery = jobTypeQuery + expQuery + salQuery + expectedSalQuery  + eduMatrix + locQuery  + ratingQuery
            + maritalStatusQuery + source1GenderQuery + noticePeriodQuery + langdata + apUserCvs + filterQuery + locationData + ageQuery ;

        console.log('locationData =========',locationData);
        jobSeekerQuery +=
            " SELECT SQL_CALC_FOUND_ROWS * from (SELECT tcv.tid as cvId,m.FirstName as firstName,m.LastName as lastName," +
            "m.ISDMobileNumber as isdMobile,m.MobileNumber as mobile,m.ISDPhoneNumber as isdPhone,m.PhoneNumber as phone," +
            "m.AdminEmailID as email,AddressLine1 as locationString,tcv.salary as currentSalary,tcv.salarytype as currentSalaryType," +
            "tcv.currentemployer as currentEmployeer," + distanceQuery + "," +
            "ifnull((SELECT tapuser.APLoginID FROM tapuser WHERE tapuser.TID=m.APUserid),'') as createdBy,m.CreatedDate as createdDate," +
            "ifnull((SELECT tapmaster.APCode FROM tapmaster WHERE tapmaster.TID=(SELECT tapuser.APMasterID FROM tapuser WHERE tapuser.TID=m.APUserid)),'') as createdAP," +
            "ifnull((SELECT t_docsandurls.image FROM t_docsandurls where t_docsandurls.masterid=m.tid AND t_docsandurls.tag='PIC' LIMIT 0,1),'') " +
            "as candidatePicture,datediff(UTC_TIMESTAMP(),tcv.LUdate) as resumeFreshnessPeriod ," +
            "IF(OID=0,(SELECT image from t_docsandurls WHERE masterid=tcv.MasterID AND tag='CV' AND imageurl=0 LIMIT 0,1),tcv.CVDoc) as resumeLink," +
            "(SELECT GROUP_CONCAT(LOCTitle) FROM mloc WHERE FIND_IN_SET(mloc.tid,ifnull((SELECT GROUP_CONCAT(LOCid) FROM tcv_loc WHERE" +
            " tcv_loc.cvid=tcv.tid),''))) as lineOfCareerList FROM  tcv AS tcv LEFT JOIN tmaster m on m.tid=tcv.MasterID "
            + edujoin + locjoin + filterQuery1  + langjoin +locationJoin +
            "   WHERE m.tid=tcv.masterid and tcv.availableForJobAfter<=UTC_TIMESTAMP() and tcv.Status=1  " + sourceQry
            + skillKeywordsQueryParts + subQuery;
        jobSeekerQuery +=
            "  group by tcv.tid )  data ORDER BY resumeFreshnessPeriod asc,distance desc  LIMIT "+req.db.escape(start)+","+req.db.escape(limit)+" ;"

        jobSeekerQuery +=" select FOUND_ROWS() as count; ";



        console.log('jobSeekerQuery',jobSeekerQuery);
        //res.send(jobSeekerQuery);
        //return;
        req.db.query(jobSeekerQuery,function(err,results){
            if(err){
                console.log('err',err);
                res.status(400).json(err);
            }
            else{
                console.error('results',results);
                var respMsg = {
                    status : true,
                    message : "Job seeker result loaded successfully",
                    data : [],
                    count : 0
                };
                if(results[0]){
                    for(var i=0; i < results[0].length; i++){
                        results[0][i].resumeLink = (results[0][i].resumeLink) ?
                        req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + results[0][i].resumeLink : '';
                        results[0][i].candidatePicture = (results[0][i].candidatePicture) ?
                        req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + results[0][i].candidatePicture : '';
                    }
                    for (var y = 0; y < results[0].length; y++){
                        var tempArray = (results[0][y].lineOfCareerList) ?
                            results[0][y].lineOfCareerList.split(',') : [];
                        for (var x = 0; x < tempArray.length; x++){
                            var locObj = {};
                            locObj.locTitle = tempArray[x];
                        }
                        locList.push(locObj);
                        results[0][y].lineOfCareerList = locList
                    }


                    var lineOfCareerList =
                    respMsg.data = results[0];
                }
                if(results[1]){
                    respMsg.count = (results[1][0]) ? ((results[1][0].count) ? results[1][0].count : 0) : 0;
                }
                res.json(respMsg);
            }
        });
    }

    console.log('locationQuery',locationQuery);
    if (locationList){
        /**
         * country default <''>
         *
         *
         * mapType default <0>
         */
        for (var a = 0; a < locationList.length; a++){
            var locationQueryParams = [ req.db.escape(locationList[a].locationTitle) ,
                req.db.escape(locationList[a].latitude),
                req.db.escape(locationList[a].longitude),
                req.db.escape(''),
                req.db.escape(0)
            ];
            locationQuery += 'CALL psavejoblocation ( ' + locationQueryParams + ' );';
        }
        req.db.query(locationQuery, function (err, locationResults) {
            if (!err && locationResults && locationResults[0][0] && locationResults[0][0].id){
                for (var b = 0; b < locationResults.length/2; b++){
                    locationIdArray.push(locationResults[b*2][0].id);
                }
                locationId = locationIdArray.join(',');
                if (locationId){
                    locationJoin = ' LEFT OUTER JOIN tprefferedcities f on f.CVID=tcv.TID ,mjobloc g ';
                    distanceQuery = '  Round(1.6*(3959 * acos (cos ( radians(g.latitude) )* cos( radians( f.latitude) )* cos( radians( \
                    f.longitude ) - radians(g.longitude) )+ sin ( radians(g.latitude) )* sin( radians( f.latitude )))),2)  as distance ' ;
                    locationData = ' and find_in_set(g.tid,"' + locationId +'") ';
                }

                preparedQuery ();

            }
            else {
                console.log('Error in save location query', err);
                preparedQuery ();

            }
        });
    }
    else {
        preparedQuery ();
    }

};



module.exports = SearchResumeCtrl;