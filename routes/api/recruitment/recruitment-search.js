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
    var skillKeywords = req.body.skillKeywords;
    //var skillKeywords = "";
    var start = req.body.page_count;
    var limit = req.body.page_size;

    //var gender = "0";
    var gender = req.body.gender;



    var source1GenderQuery = "";
    gender = (gender == 2) ? "'0,1,2'" : ((gender) ? "'"+gender+ "'": "'0,1,2'");
    source1GenderQuery = " AND FIND_IN_SET(tcv.Gender,"+gender+") ";

    /**
     * @login_tid TID of a user who is logged in (from tmaster)
     */
    var jobSeekerQuery =
        "SET @user_ids = (SELECT get_account_users("+req.db.escape(token)+"));";

    if(source){
        switch (source){
            case "1,2" :
                jobSeekerQuery +=
                    "SELECT tcv.TID AS cvid,tcv.OID,tcv.MasterID, \
                     CONCAT(tcv.firstname,' ',tcv.lastName) AS Name, \
                tcv.salary AS ctc, tcv.Exp, tcv.noticeperiod, \
                tcv.KeySkills, tcv.mobile_no, tcv.CVDoc, tcv.Status FROM tcv AS tcv WHERE  FIND_IN_SET(tcv.OID,@user_ids)" + source1GenderQuery ;
                jobSeekerQuery += (skillKeywords) ? "AND MATCH (tcv.KeySkills) AGAINST ("+req.db.escape(skillKeywords) +")" : "";
                jobSeekerQuery +=
                    "UNION " +
                    "SELECT tcv.TID AS cvid,tcv.OID,tcv.MasterID,\
                    (SELECT CONCAT(FirstName,' ',LastName) FROM tmaster WHERE tmaster.TID = tcv.MasterID) AS Name, \
                    tcv.salary AS ctc, tcv.Exp, tcv.noticeperiod, \
                    tcv.KeySkills, tcv.mobile_no, tcv.CVDoc, tcv.Status FROM tcv AS tcv \
                    WHERE MasterID > 0 AND (OID = 0 OR  FIND_IN_SET(tcv.OID,@user_ids)) " + source1GenderQuery ;
                jobSeekerQuery += (skillKeywords) ? "AND MATCH (tcv.KeySkills) AGAINST ("+req.db.escape(skillKeywords) +")" : "";
                jobSeekerQuery +=    " ORDER BY cvid DESC LIMIT "+req.db.escape(start)+","+req.db.escape(limit)+";"

                jobSeekerQuery += "SELECT FOUND_ROWS() AS count;";

                break;

            case "2,1":
                jobSeekerQuery +=
                    "SELECT tcv.TID AS cvid,tcv.OID,tcv.MasterID, \
                     CONCAT(tcv.firstname,' ',tcv.lastName) AS Name, \
                tcv.salary AS ctc, tcv.Exp, tcv.noticeperiod, \
                tcv.KeySkills, tcv.mobile_no, tcv.CVDoc, tcv.Status FROM tcv AS tcv WHERE  FIND_IN_SET(tcv.OID,@user_ids)" + source1GenderQuery ;
                    + source1GenderQuery;
                jobSeekerQuery += (skillKeywords) ? "AND MATCH (tcv.KeySkills) AGAINST ("+req.db.escape(skillKeywords) +")" : "";
                jobSeekerQuery +=
                    "UNION " +
                    "SELECT tcv.TID AS cvid,tcv.OID,tcv.MasterID,\
                    (SELECT CONCAT(FirstName,' ',LastName) FROM tmaster WHERE tmaster.TID = tcv.MasterID) AS Name, \
                    tcv.salary AS ctc, tcv.Exp, tcv.noticeperiod, \
                    tcv.KeySkills, tcv.mobile_no, tcv.CVDoc, tcv.Status FROM tcv AS tcv \
                    WHERE MasterID > 0 AND (OID = 0 OR  FIND_IN_SET(tcv.OID,@user_ids)) " + source1GenderQuery;
                jobSeekerQuery += (skillKeywords) ? "AND MATCH (tcv.KeySkills) AGAINST ("+req.db.escape(skillKeywords) +")" : "";
                jobSeekerQuery +=    " ORDER BY cvid DESC LIMIT "+req.db.escape(start)+","+req.db.escape(limit)+";"

                jobSeekerQuery += "SELECT FOUND_ROWS() AS count;";

                break;

            case "2":
                jobSeekerQuery +=
                    "SELECT tcv.TID AS cvid,tcv.OID,tcv.MasterID,\
                    (SELECT CONCAT(FirstName,' ',LastName) FROM tmaster WHERE tmaster.TID = tcv.MasterID) AS Name, \
                    tcv.salary AS ctc, tcv.Exp, tcv.noticeperiod, \
                    tcv.KeySkills, tcv.mobile_no, tcv.CVDoc, tcv.Status FROM tcv AS tcv \
                    WHERE MasterID > 0 AND (OID = 0 OR  FIND_IN_SET(tcv.OID,@user_ids)) " + source1GenderQuery ;
                jobSeekerQuery += (skillKeywords) ? "AND MATCH (tcv.KeySkills) AGAINST ("+req.db.escape(skillKeywords) +")" : "";
                jobSeekerQuery +=    " ORDER BY cvid DESC LIMIT "+req.db.escape(start)+","+req.db.escape(limit)+";"

                jobSeekerQuery += "SELECT FOUND_ROWS() AS count;";

                break;

            default :

                jobSeekerQuery +=
                    "SELECT tcv.TID AS cvid,tcv.OID,tcv.MasterID, \
                     CONCAT(tcv.firstname,' ',tcv.lastName) AS Name, \
                tcv.salary AS ctc, tcv.Exp, tcv.noticeperiod, \
                tcv.KeySkills, tcv.mobile_no, tcv.CVDoc, tcv.Status FROM tcv AS tcv WHERE  FIND_IN_SET(tcv.OID,@user_ids)"
                jobSeekerQuery += (skillKeywords) ? "AND MATCH (tcv.KeySkills) AGAINST ("+req.db.escape(skillKeywords) +")" : "";
                jobSeekerQuery +=    " ORDER BY cvid DESC LIMIT "+req.db.escape(start)+","+req.db.escape(limit)+";"

                jobSeekerQuery += "SELECT FOUND_ROWS() AS count; ";
                break;
        }
    }

    jobSeekerQuery += "SELECT @user_ids AS users;"

console.log(jobSeekerQuery);

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
            if(results[1]){
                for(var i=0; i < results[1].length; i++){
                    results[1][i].surl = (results[1][i].CVDoc) ?
                    req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + results[1][i].CVDoc : '';
                }
                respMsg.data = results[1];
            }
            if(results[2]){
                respMsg.count = (results[2][0]) ? ((results[2][0].count) ? results[2][0].count : 0) : 0;
            }
            res.json(respMsg);
        }
    });
});

module.exports = router;