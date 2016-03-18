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

module.exports = router;