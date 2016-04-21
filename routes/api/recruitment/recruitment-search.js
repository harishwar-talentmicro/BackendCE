var express = require('express');
var router = express.Router();


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @discription : API to get institute list based on search keyword or based on institute_group_id
 * @param token* <string> token of login user
 * @param q <string> Search term (keyword) for searching institute and group of institutes
 * @param institute_group_id <int>
 *
 * @desc If institute_group_id is passed then it will get priority and
 * search will return all those institute which are under that institute group
 */
router.get('/institute',function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    req.query.institute_group_id = (req.query.institute_group_id) ? parseInt(req.query.institute_group_id) : 0;

    if(isNaN(req.query.institute_group_id) || req.query.institute_group_id < 1){
        req.query.institute_group_id = 0;
    }

    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else{
        try {
            if (req.query.token) {
                req.st.validateToken(req.query.token, function (err, tokenResult) {
                    if (!err) {
                        if (tokenResult) {
                            var query = "";
                            /**
                             * Flag which shows whether to execute query or not
                             */
                            var queryExecFlag = true;
                            if( req.query.institute_group_id){
                                var queryParams = req.db.escape(req.query.institute_group_id);
                                query = 'CALL get_group_clg_institutes(' + queryParams + ')';
                            }
                            else{
                                if(!req.query.q){
                                    queryExecFlag = false;
                                }
                                var queryParams = req.db.escape(req.query.token) + ',' + req.db.escape(req.query.q);
                                query = 'CALL sugg_list_clgs(' + queryParams + ')';
                            }
                            console.log(query);
                            if(queryExecFlag){
                                req.db.query(query, function (err, results) {
                                    if (!err) {
                                        console.log(results);
                                        if (results) {
                                            if (results[0]) {
                                                if (results[0].length > 0) {
                                                    responseMessage.status = true;
                                                    responseMessage.data = results[0];
                                                    responseMessage.error = null;
                                                    responseMessage.message = ' Search result loaded successfully';
                                                    res.status(200).json(responseMessage);
                                                }
                                                else {
                                                    responseMessage.message = 'No data available';
                                                    responseMessage.status = true;
                                                    res.json(responseMessage);
                                                }
                                            }
                                            else {
                                                responseMessage.message = 'No data available';
                                                res.json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.message = 'No data available';
                                            res.json(responseMessage);
                                        }

                                    }
                                    else {
                                        responseMessage.data = null;
                                        responseMessage.message = 'Error in getting search result';
                                        console.log('getInstituteConfig: Error in getting search result' + err);
                                        res.status(500).json(responseMessage);
                                    }
                                });
                            }
                            else{
                                console.log('Search Query param empty so not loading any colleges')
                                responseMessage.status = true;
                                responseMessage.data = [];
                                responseMessage.error = null;
                                responseMessage.message = ' Search result loaded successfully';
                                res.status(200).json(responseMessage);
                            }

                        }
                        else {
                            responseMessage.message = 'Invalid token';
                            responseMessage.error = {
                                token: 'Invalid Token'
                            };
                            responseMessage.data = null;
                            res.status(401).json(responseMessage);
                            console.log('sugg_list_clgs: Invalid token');
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'Error in validating Token';
                        res.status(500).json(responseMessage);
                        console.log('sugg_list_clgs:Error in processing Token' + err);
                    }
                });
            }

            else {
                if (!req.query.token) {
                    responseMessage.message = 'Invalid Token';
                    responseMessage.error = {
                        Token : 'Invalid Token'
                    };
                    console.log('sugg_list_clgs: Token is mandatory field');
                }

                res.status(401).json(responseMessage);
            }
        }
        catch (ex) {
            responseMessage.error = {};
            responseMessage.message = 'An error occured !';
            console.log('sugg_list_clgs:error ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(400).json(responseMessage);
        }
    }
});


router.post('/job_seeker',function(req,res,next){

    //var token = "1e505ef5-f1ab-11e5-9ed2-42010af0ea4e";
    var token = req.body.token;
// 1 means internal (own db)
// 2 means ezeone db
//    var source = "1";
    var source = (req.body.source) ? req.body.source : "1,2";
    var skillKeywordsList = (req.body.skillKeywords) ? req.body.skillKeywords.split(',') : [];

    var skillKeywordsQueryParts = [];
    if(skillKeywordsList.length){
        skillKeywordsQueryParts.push(" MATCH (tcv.KeySkills) AGAINST ("+ req.db.escape(skillKeywordsList.join(' ')) + "  IN BOOLEAN MODE ) ");
    }
    //var skillKeywords = "";
    var start = req.body.page_count;
    var limit = req.body.page_size;

    //var gender = "0";
    var gender = req.body.gender;

    gender = (gender == 2) ? "0,1,2" : ((gender) ? ""+gender+ "": "0,1,2");
    var source1GenderQuery = " AND FIND_IN_SET(tcv.Gender,"+req.db.escape(gender)+") ";

    var expQuery = '';
    var salQuery  = '';
    var instituteQuery = '';
    var eduMatrixArray = [];
    var eduMatrix = '';
    var edujoin = '';
    var locMatrixArray = [];
    var locdata = '';
    var locjoin = '';

    if(req.body.experience_from && req.body.experience_to){
        expQuery = " AND tcv.Exp>=" + req.db.escape(req.body.experience_from) + "AND tcv.Exp <= " + req.db.escape(req.body.experience_to);
    }
    /**
     * converting salary to annual bases
     */
    if (req.body.salary_from && req.body.salary_to){
        if (parseInt(req.body.salary_type) == 1){
            req.body.salary_from = Math.round( (req.body.salary_from) * 2112.00) ;
            req.body.salary_to = Math.round( (req.body.salary_to) * 2112.00 );
        }
        if (parseInt(req.body.salary_type) == 2){
            req.body.salary_from = Math.round( ((req.body.salary_from) * 2112.00)/176);
            req.body.salary_to = Math.round( ((req.body.salary_to) * 2112.00)/176) ;
        }
        salQuery = " AND tcv.salary >= " + req.db.escape(req.body.salary_from)+ " AND tcv.salary <=" +req.db.escape(req.body.salary_to);
    }
    if (req.body.institute_id) {
        instituteQuery = ' AND (SELECT concat(",(",GROUP_CONCAT(Instituteid),"),") FROM tcv_education WHERE CVID=tcv.TID) ' +
            ' REGEXP ' + '"' + req.db.escape(req.body.institute_id) + '"';
    }

    /**
     * preparing query for education
     */
    var educations = req.body.jobEducations;
    if (educations){
        if (educations.length > 0){
            for ( var j = 0; j < educations.length; j++){
                var eduSkills = {
                    education: (educations[j].edu_id) ? educations[j].edu_id.toString() : '',
                    spc: educations[j].spc_id ? educations[j].spc_id.toString() : '',
                    score_from: educations[j].score_from ? educations[j].score_from.toString() : '',
                    score_to: educations[j].score_to ? educations[j].score_to.toString() : ''
                };
                eduMatrixArray.push(' (FIND_IN_SET(edu.Educationid,' + req.db.escape(eduSkills.education) + ') ' +
                     ' AND FIND_IN_SET(edu.Specializationids,' +  req.db.escape(eduSkills.spc) + ') ' +
                     ' AND edu.Score>=' + req.db.escape(eduSkills.score_from) + ' AND edu.Score<=' + req.db.escape(eduSkills.score_to) + ')');
            }
            eduMatrix += (eduMatrixArray.length) ? " AND ( "+ eduMatrixArray.join(" OR ") +") " : "";
            edujoin = ' LEFT OUTER JOIN tcv_education edu ON edu.cvid=tcv.tid ';
        }
    }
    /**
     * preparing query for Line of career
     */
    var locMatrix = req.body.locMatrix;
    if (locMatrix){
        if (locMatrix.length > 0){
            for ( var k = 0; k < locMatrix.length; k++){
                var locSkills = {

                    locIds: locMatrix[k].career_id ? locMatrix[k].career_id.toString() : '',
                    exp_from: locMatrix[k].exp_from ? locMatrix[k].exp_from.toString() : 0,
                    exp_to: locMatrix[k].exp_to ? locMatrix[k].exp_to.toString() : 50,
                    level: locMatrix[k].expertiseLevel ? locMatrix[k].expertiseLevel.toString() : '',
                    scoreFrom: locMatrix[k].score_from ? locMatrix[k].score_from.toString() : 0,
                    scoreTo: locMatrix[k].score_to ? locMatrix[k].score_to.toString() : 100
                };
                locMatrixArray.push(' (FIND_IN_SET(loc.LOCid,' + req.db.escape(locSkills.locIds) + ') '+
                ' AND FIND_IN_SET(loc.Level,' + req.db.escape(locSkills.level) + ') ' +
                ' AND loc.Exp>=' + req.db.escape(locSkills.exp_from) + ' AND loc.Exp<=' + req.db.escape(locSkills.exp_to) +
                ' AND loc.Score >=' + req.db.escape(locSkills.scoreFrom) + ' AND loc.Score <=' + req.db.escape(locSkills.scoreTo) + ')');
            }
            locdata += (locMatrixArray.length) ? " AND ( "+ locMatrixArray.join(" OR ") +") " : "";
            locjoin = ' LEFT OUTER JOIN tcv_loc loc ON loc.cvid=tcv.tid ';
        }
    }

    /**
     * checking condition for status (hidden or visible)
     */

    var filterQuery = '';
    var status;
    var filterQuery1='';

    var masterID = "SET @masterid = (SELECT masterid FROM tloginout WHERE token =" +req.db.escape(token)+");";
    console.log("req.body.filter_type",req.body.filter_type);
    if (parseInt(req.body.filter_type) == 0){
        filterQuery = " AND NOT FIND_IN_SET(tcv.tid,ifnull((SELECT GROUP_CONCAT(cvid) FROM tapplicant_hidden WHERE masterid=" + '@masterid' + "),''))";
        status = "," + 1 +" as status";
    }
    else if (parseInt(req.body.filter_type) == 1){
         filterQuery1 = " left outer join tapplicant_hidden z on z.cvid=tcv.tid";
        filterQuery = " or z.cvid=tcv.tid";
        status = " ,if(z.tid is null," + 1 + "," + 0 + ") as status";
    }
    else {
        filterQuery = " AND FIND_IN_SET(tcv.tid,ifnull((SELECT GROUP_CONCAT(cvid) FROM tapplicant_hidden WHERE masterid=" + '@masterid' + "),''))";
        status = ","+ 0 + " as status";
    }

    /**
     * concatenating all above prepared query
     */
    var subQuery = expQuery + salQuery + instituteQuery + eduMatrix + locdata + filterQuery;
    //console.log("subQuery",subQuery);


    /**
     * @login_tid TID of a user who is logged in (from tmaster)
     */
    var jobSeekerQuery =
        "SET @user_ids = (SELECT get_account_users("+req.db.escape(token)+"));";
    jobSeekerQuery+=masterID;

    if(source){
        switch (source){
            case "1,2" :
                jobSeekerQuery +=
                    " SELECT SQL_CALC_FOUND_ROWS * from (SELECT tcv.TID AS cvid,(SELECT GROUP_CONCAT(Locname) FROM mjobloc WHERE \
                     find_in_set(mjobloc.tid,(SELECT GROUP_CONCAT(CityID) FROM tprefferedcities WHERE CVID=tcv.TID))) as location,\
                     tcv.OID,tcv.MasterID, \
                     CONCAT(tcv.firstname,' ',tcv.lastName) AS Name,\
                tcv.salary AS ctc, tcv.Exp, tcv.noticeperiod, \
                tcv.KeySkills, tcv.mobile_no, IF(OID=0,(SELECT image from t_docsandurls WHERE masterid=tcv.MasterID AND tag='CV' AND imageurl=0 LIMIT 0,1),tcv.CVDoc) as CVDoc " + status + " FROM tcv AS tcv "+ edujoin + locjoin + filterQuery1 +
                    "   WHERE  FIND_IN_SET(tcv.OID,@user_ids) and tcv.Status=1 AND tcv.jobid = 0 " + source1GenderQuery ;
                jobSeekerQuery += (skillKeywordsQueryParts.length) ? " AND ( "+ skillKeywordsQueryParts.join(" OR ") +") " : "";
                jobSeekerQuery+=subQuery   ;
                jobSeekerQuery +=
                    " UNION " +
                    " SELECT tcv.TID AS cvid,(SELECT GROUP_CONCAT(Locname) FROM mjobloc WHERE \
                     find_in_set(mjobloc.tid,(SELECT GROUP_CONCAT(CityID) FROM tprefferedcities WHERE CVID=tcv.TID))) as location,\
                tcv.OID,tcv.MasterID,\
                    (SELECT CONCAT(FirstName,' ',LastName) FROM tmaster WHERE tmaster.TID = tcv.MasterID) AS Name, \
                    tcv.salary AS ctc, tcv.Exp, tcv.noticeperiod, \
                    tcv.KeySkills, tcv.mobile_no,IF(OID=0,(SELECT image from t_docsandurls WHERE masterid=tcv.MasterID AND tag='CV' AND imageurl=0 LIMIT 0,1),tcv.CVDoc) as CVDoc " + status + " FROM tcv AS tcv "+ edujoin + locjoin + filterQuery1 +"  \
                    WHERE tcv.MasterID > 0 and tcv.Status=1 and tcv.jobid=0 AND OID = 0 " + source1GenderQuery ;
                jobSeekerQuery += (skillKeywordsQueryParts.length) ? " AND ( "+ skillKeywordsQueryParts.join(" OR ") +") "  : "";
                jobSeekerQuery+=subQuery ;

                jobSeekerQuery +=    " ORDER BY cvid DESC )  data  LIMIT "+req.db.escape(start)+","+req.db.escape(limit)+" ;"

                jobSeekerQuery+=" select FOUND_ROWS() as count; ";

                //var countQuery = "SELECT COUNT(*) AS count FROM (SELECT TID FROM tcv AS tcv WHERE  FIND_IN_SET(tcv.OID,@user_ids)" + source1GenderQuery ;
                //countQuery += (skillKeywordsQueryParts.length) ? " AND ( "+ skillKeywordsQueryParts.join(" OR ") +") " : "";
                //countQuery +=
                //    "UNION " +
                //    "SELECT TID FROM tcv AS tcv \
                //    WHERE MasterID > 0 AND (OID = 0 OR  FIND_IN_SET(tcv.OID,@user_ids)) " + source1GenderQuery ;
                //countQuery += (skillKeywordsQueryParts.length) ? " AND ( "+ skillKeywordsQueryParts.join(" OR ") +") "  : "";
                //countQuery += ") AS tmp;"

                //jobSeekerQuery += "SELECT FOUND_ROWS() AS count;";

                //jobSeekerQuery += countQuery;

                break;

            case "2,1":
                jobSeekerQuery +=
                    " SELECT SQL_CALC_FOUND_ROWS * from (SELECT tcv.TID AS cvid,(SELECT GROUP_CONCAT(Locname) FROM mjobloc WHERE \
                     find_in_set(mjobloc.tid,(SELECT GROUP_CONCAT(CityID) FROM tprefferedcities WHERE CVID=tcv.TID))) as location,\
                     tcv.OID,tcv.MasterID, \
                     CONCAT(tcv.firstname,' ',tcv.lastName) AS Name,\
                tcv.salary AS ctc, tcv.Exp, tcv.noticeperiod, \
                tcv.KeySkills, tcv.mobile_no, IF(OID=0,(SELECT image from t_docsandurls WHERE masterid=tcv.MasterID AND tag='CV' AND imageurl=0 LIMIT 0,1),tcv.CVDoc) as CVDoc "
                    + status + " FROM tcv AS tcv "+ edujoin + locjoin + filterQuery1 +
                    "   WHERE  FIND_IN_SET(tcv.OID,@user_ids) and tcv.Status=1 AND tcv.jobid = 0 " + source1GenderQuery ;
                jobSeekerQuery += (skillKeywordsQueryParts.length) ? " AND ( "+ skillKeywordsQueryParts.join(" OR ") +") " : "";
                jobSeekerQuery+=subQuery   ;
                jobSeekerQuery +=
                    " UNION " +
                    " SELECT tcv.TID AS cvid,(SELECT GROUP_CONCAT(Locname) FROM mjobloc WHERE \
                     find_in_set(mjobloc.tid,(SELECT GROUP_CONCAT(CityID) FROM tprefferedcities WHERE CVID=tcv.TID))) as location,\
                tcv.OID,tcv.MasterID,\
                    (SELECT CONCAT(FirstName,' ',LastName) FROM tmaster WHERE tmaster.TID = tcv.MasterID) AS Name, \
                    tcv.salary AS ctc, tcv.Exp, tcv.noticeperiod, \
                    tcv.KeySkills, tcv.mobile_no,IF(OID=0,(SELECT image from t_docsandurls WHERE masterid=tcv.MasterID AND tag='CV' AND imageurl=0 LIMIT 0,1),tcv.CVDoc) as CVDoc "
                    + status + " FROM tcv AS tcv "+ edujoin + locjoin + filterQuery1 +"  \
                    WHERE tcv.MasterID > 0 and tcv.Status=1 and tcv.jobid=0 AND OID = 0 " + source1GenderQuery ;
                jobSeekerQuery += (skillKeywordsQueryParts.length) ? " AND ( "+ skillKeywordsQueryParts.join(" OR ") +") "  : "";
                jobSeekerQuery+=subQuery ;

                jobSeekerQuery +=    " ORDER BY cvid DESC )  data  LIMIT "+req.db.escape(start)+","+req.db.escape(limit)+" ;"

                jobSeekerQuery+=" select FOUND_ROWS() as count; ";

                break;

            case "2":
                jobSeekerQuery +=
                    " SELECT SQL_CALC_FOUND_ROWS * from (SELECT tcv.TID AS cvid,(SELECT GROUP_CONCAT(Locname) FROM mjobloc WHERE \
                     find_in_set(mjobloc.tid,(SELECT GROUP_CONCAT(CityID) FROM tprefferedcities WHERE CVID=tcv.TID))) as location,\
                    tcv.OID,tcv.MasterID,\
                    (SELECT CONCAT(FirstName,' ',LastName) FROM tmaster WHERE tmaster.TID = tcv.MasterID) AS Name, \
                    tcv.salary AS ctc, tcv.Exp, tcv.noticeperiod, \
                    tcv.KeySkills, tcv.mobile_no, IF(OID=0,(SELECT image from t_docsandurls WHERE masterid=tcv.MasterID AND tag='CV' AND imageurl=0 LIMIT 0,1),tcv.CVDoc) as CVDoc "
                    + status + " FROM tcv AS tcv "+ edujoin + locjoin + filterQuery1 +" \
                    WHERE tcv.MasterID > 0 and tcv.Status=1 and tcv.jobid=0  AND OID = 0  " + source1GenderQuery ;
                jobSeekerQuery += (skillKeywordsQueryParts.length) ?  " AND ( "+ skillKeywordsQueryParts.join(" OR ") +") " : "";
                jobSeekerQuery+=subQuery ;

                jobSeekerQuery +=    " ORDER BY cvid DESC )  data  LIMIT "+req.db.escape(start)+","+req.db.escape(limit)+" ;"
                jobSeekerQuery+=" select FOUND_ROWS() as count; ";

                //var countQuery =     "SELECT COUNT(*) AS count FROM tcv AS tcv \
                //    WHERE MasterID > 0 AND (OID = 0 OR  FIND_IN_SET(tcv.OID,@user_ids)) " + source1GenderQuery ;
                //countQuery += (skillKeywordsQueryParts.length) ?  " AND ( "+ skillKeywordsQueryParts.join(" OR ") +") ;" : ";";
                //
                ////jobSeekerQuery += "SELECT FOUND_ROWS() AS count;";
                //
                //jobSeekerQuery += countQuery;

                break;

            default :

                jobSeekerQuery +=
                    " SELECT SQL_CALC_FOUND_ROWS * from (SELECT tcv.TID AS cvid, (SELECT GROUP_CONCAT(Locname) FROM mjobloc WHERE \
                     find_in_set(mjobloc.tid,(SELECT GROUP_CONCAT(CityID) FROM tprefferedcities WHERE CVID=tcv.TID))) as location,\
                    tcv.OID,tcv.MasterID, \
                     CONCAT(tcv.firstname,' ',tcv.lastName) AS Name, \
                tcv.salary AS ctc, tcv.Exp, tcv.noticeperiod, \
                tcv.KeySkills, tcv.mobile_no,  IF(OID=0,(SELECT image from t_docsandurls WHERE masterid=tcv.MasterID AND tag='CV' AND imageurl=0 LIMIT 0,1),tcv.CVDoc) as CVDoc "
                    + status + " FROM tcv AS tcv " + edujoin + locjoin + filterQuery1 +
                    " WHERE  FIND_IN_SET(tcv.OID,@user_ids) and tcv.Status=1 AND tcv.jobid = 0 " + source1GenderQuery ;
                jobSeekerQuery += (skillKeywordsQueryParts.length) ?  " AND ( "+ skillKeywordsQueryParts.join(" OR ") +") ": "";
                jobSeekerQuery+=subQuery   ;
                jobSeekerQuery +=    " ORDER BY cvid DESC )  data  LIMIT "+req.db.escape(start)+","+req.db.escape(limit)+" ;"
                jobSeekerQuery+=" select FOUND_ROWS() as count; ";

                //var countQuery = "SELECT COUNT(*) AS count FROM tcv AS tcv WHERE  FIND_IN_SET(tcv.OID,@user_ids)"
                //countQuery += (skillKeywordsQueryParts.length) ?  " AND ( "+ skillKeywordsQueryParts.join(" OR ") +") ;": ";";
                //
                ////jobSeekerQuery += "SELECT FOUND_ROWS() AS count; ";
                //jobSeekerQuery += countQuery;
                break;
        }
    }

    jobSeekerQuery += " SELECT @user_ids AS users;";



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
            if(results[2]){
                for(var i=0; i < results[2].length; i++){
                    results[2][i].surl = (results[2][i].CVDoc) ?
                    req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + results[2][i].CVDoc : '';
                }
                respMsg.data = results[2];
            }
            if(results[3]){
                respMsg.count = (results[3][0]) ? ((results[3][0].count) ? results[3][0].count : 0) : 0;
            }
            res.json(respMsg);
        }
    });
});

module.exports = router;