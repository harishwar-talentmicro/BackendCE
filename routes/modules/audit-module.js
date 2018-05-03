/**
 *  @author Indrajeet
 *  @since June 25,2015 11:24 AM IST
 *  @title Audit module
 *  @description Handles functions related to access history, create update and edit records
 *  1. Access History Fetching for EZEID
 *
 */
"use strict";
var path ='D:\\EZEIDBanner\\';
var EZEIDEmail = 'noreply@ezeone.com';
var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
var CONFIG = require('../../ezeone-config.json');
var DBSecretKey=CONFIG.DB.secretKey;

var st = null;

function Audit(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Audit.prototype.getAccessHistory = function(req,res,next){
    /**
     * @todo FnGetAccessHistory
     */

    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.TokenNo;
        //var Page = parseInt(req.query.Page);
        var pageSize = (req.query.page_size) ? parseInt(req.query.page_size) : 100;
        var pageCount = (req.query.page_count) ? parseInt(req.query.page_count) : 0;

        var responseMessage = {
            status: false,
            error: {},
            message: '',
            count:0,
            data: []
        };

        if (Token) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        //var ToPage = 25 * Page;
                        //var FromPage = ToPage - 24;
                        //
                        //if (FromPage <= 1) {
                        //    FromPage = 0;
                        //}
                        console.log('CALL pAccessHistory(' + st.db.escape(Token) + ',' + st.db.escape(pageSize) + ',' + st.db.escape(pageCount) + ',' + st.db.escape(DBSecretKey) + ')');
                        st.db.query('CALL pAccessHistory(' + st.db.escape(Token) + ',' + st.db.escape(pageSize) + ',' + st.db.escape(pageCount) + ',' + st.db.escape(DBSecretKey) + ')', function (err, AccessHistoryResult) {
                            if (!err) {
                                //console.log(AccessHistoryResult);
                                if (AccessHistoryResult) {
                                    if (AccessHistoryResult[0]) {
                                        if (AccessHistoryResult[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'AccessHistory List loaded successfully';
                                            responseMessage.count = AccessHistoryResult[0][0].count;
                                            responseMessage.data = AccessHistoryResult[0];
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetAccessHistory: AccessHistory List loaded successfully');
                                        }
                                        else {
                                            responseMessage.message = 'AccessHistory List not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetAccessHistory:AccessHistory List not loaded');
                                        }

                                    }
                                    else {
                                        responseMessage.message = 'AccessHistory List not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetAccessHistory:AccessHistory List not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'AccessHistory List not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetAccessHistory:AccessHistory List not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetAccessHistory: error in getting AccessHistory:' + err);
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
                        console.log('FnGetAccessHistory: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetAccessHistory:Error in processing Token' + err);
                }
            });

        }
        else {
            if (!Token) {
                console.log('FnGetAccessHistory: Token is empty');
                responseMessage.error = {
                    token : 'Token is empty'
                };
                responseMessage.message = 'Please check the errors';
                res.status(400).json(responseMessage);
            }

            res.statusCode = 400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnGetAccessHistory error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Audit.prototype.saveList = function(req,res,next){
    /**
     * @todo FnSaveWhiteBlackList
     */

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var List = req.body.List;
        var RelationType =parseInt(req.body.RelationType);
        var Tag = parseInt(req.body.Tag);
        var EZEID = req.st.alterEzeoneId(req.body.EZEID);
        var Token = req.body.Token;

        var RtnMessage = {
            IsSuccessfull: false
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (List!= null && !isNaN(RelationType) && !isNaN(Tag) && EZEID !=null && Token) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var query = st.db.escape(List) + ',' + st.db.escape(RelationType) + ',' + st.db.escape(EZEID) + ',' + st.db.escape(Tag) + ',' +st.db.escape(Token);
                        st.db.query('CALL pSavewhiteblacklist(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult) {
                                    if (InsertResult.affectedRows > 0) {
                                        RtnMessage.IsSuccessfull = true;
                                        res.send(RtnMessage);
                                        console.log('FnSaveWhiteBlackList: White/Black list details save successfully');
                                    }
                                    else {
                                        console.log('FnSaveWhiteBlackList:No Save White/Black list details');
                                        res.send(RtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnSaveWhiteBlackList:No Save White/Black list details');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnSaveWhiteBlackList: error in Updating White/Black list' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveWhiteBlackList: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveWhiteBlackList:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (List == null) {
                console.log('FnSaveWhiteBlackList: List is empty');
            }
            else if (isNaN(RelationType)) {
                console.log('FnSaveWhiteBlackList: RelationType is empty');
            }
            else if (EZEID == null) {
                console.log('FnSaveWhiteBlackList: Ezeid is empty');
            }
            else if (isNaN(Tag)) {
                console.log('FnSaveWhiteBlackList: Tag is empty');
            }
            else if (!Token) {
                console.log('FnSaveWhiteBlackList: Token is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveWhiteBlackList:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Audit.prototype.getList = function(req,res,next){
    /**
     * @todo FnGetWhiteBlackList
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        //var EZEID = req.query.EZEID;


        if (Token) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        st.db.query('CALL pGetwhiteblacklist(' + st.db.escape(Token) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetWhiteBlackList: white/black list details Sent successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetWhiteBlackList:No white/black list details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetWhiteBlackList:No white/black list details found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetWhiteBlackList: error in getting white/black list' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetWhiteBlackList: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetWhiteBlackList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetWhiteBlackList: Token is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetWhiteBlackList error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Audit.prototype.deleteList = function(req,res,next){
    /**
     * @todo FnDeleteWhiteBlackList
     */

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");


        var Token = req.body.Token;
        var TID = req.body.TID;

        var RtnMessage = {
            IsSuccessfull: false
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (TID !=null && Token ) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var query = st.db.escape(Token) + ',' + st.db.escape(TID);
                        st.db.query('CALL pDeletewhiteblacklist(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult) {
                                    if (InsertResult.affectedRows > 0) {
                                        RtnMessage.IsSuccessfull = true;
                                        res.send(RtnMessage);
                                        console.log('FnDeleteWhiteBlackList: White/Black list details delete successfully');
                                    }
                                    else {
                                        console.log('FnDeleteWhiteBlackList:No delete White/Black list details');
                                        res.send(RtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnDeleteWhiteBlackList:No delete White/Black list details');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnDeleteWhiteBlackList: error in deleting White/Black list' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnDeleteWhiteBlackList: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnDeleteWhiteBlackList:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (!Token) {
                console.log('FnDeleteWhiteBlackList: Token is empty');
            }
            else if (TID == null) {
                console.log('FnDeleteWhiteBlackList: TID is empty');
            }


            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnDeleteWhiteBlackList:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Audit.prototype.getListCount = function(req,res,next){
    /**
     * @todo FnGetWhiteListCount
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var EZEID = req.st.alterEzeoneId(req.query.EZEID);
        var List=req.query.List;
        var RtnMessage = {
            WhiteListCount : 0
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (Token && EZEID != null && List != null) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var query = st.db.escape(Token) + ',' + st.db.escape(EZEID) + ',' + st.db.escape(List);

                        st.db.query('CALL pGetWhiteListCount(' + query + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0]) {
                                        if (GetResult[0].length > 0) {
                                            var WhiteListCount = GetResult[0];
                                            RtnMessage.WhiteListCount = WhiteListCount[0].WhiteListCount;
                                            console.log('FnGetWhiteListCount: white list count Sent successfully');
                                            res.send(RtnMessage);
                                        }
                                        else {

                                            console.log('FnGetWhiteListCount:No white list details found');
                                            res.send(RtnMessage);
                                        }
                                    }
                                    else {

                                        console.log('FnGetWhiteListCount:No white list details found');
                                        res.send(RtnMessage);
                                    }
                                }
                                else {

                                    console.log('FnGetWhiteListCount:No white list details found');
                                    res.send(RtnMessage);
                                }

                            }
                            else {

                                console.log('FnGetWhiteListCount: error in getting white list' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.send(RtnMessage);
                        console.log('FnGetWhiteListCount: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.send(RtnMessage);
                    console.log('FnGetWhiteListCount: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!Token) {
                console.log('FnGetWhiteListCount: Token is empty');
            }
            else if (EZEID == null) {
                console.log('FnGetWhiteListCount: EZEID is empty');
            }
            else if (List == null) {
                console.log('FnGetWhiteListCount: List is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnGetWhiteListCount error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Audit.prototype.getRelation = function(req,res,next){
    /**
     * @todo FnGetRelationType
     */

    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        if (!isNaN(LangID)) {
            var Query = 'Select RelationID, RelationshipTitle from mrelationtype where LangID=' + st.db.escape(LangID);
            st.db.query(Query, function (err, RelationTypeResult) {
                if (!err) {
                    if (RelationTypeResult) {
                        if (RelationTypeResult.length > 0) {
                            res.send(RelationTypeResult);
                            console.log('FnGetRelationType: mrelationtype: Relation Type sent successfully');
                        }
                        else {
                            res.json(null);
                            res.statusCode = 200;
                            console.log('FnGetRelationType: mrelationtype: No Relation type found');
                        }
                    }
                    else {
                        res.json(null);
                        res.statusCode = 200;
                        console.log('FnGetRelationType: mrelationtype: No Relation type found');
                    }
                }
                else {
                    res.json(null);
                    console.log('FnGetRelationType: mrelationtype:' + err);
                }
            });
        }
        else {
            res.json(null);
            res.statusCode = 400;
            console.log('FnGetRelationType: LangId is empty');
        }


    }
    catch (ex) {
        console.log('FnGetRelationType error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Audit.prototype.saveMailTemplate = function(req,res,next){
    /**
     * @todo FnSaveMailTemplate
     */

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var Title = req.body.Title;
        var FromName = (req.body.FromName) ? req.body.FromName : '';
        var FromEmailID = (req.body.FromEmailID) ? req.body.FromEmailID : '';
        var CCMailIDS = (req.body.CCMailIDS) ? req.body.CCMailIDS :'';
        var BCCMailIDS = (req.body.BCCMailIDS) ? req.body.BCCMailIDS : '';
        var Subject  = (req.body.Subject) ? req.body.Subject : '';
        var Body = req.body.Body;
        var templateType = (req.body.template_type) ? req.body.template_type : 1; //1-bulkmailer, 2-jobseekers bulkmailer, 3-notification
        var tid = (req.body.tid) ? parseInt(req.body.tid) : 0;

        var RtnMessage = {
            IsSuccessfull: false
        };

        if (Token && Title != null && Body != null ) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var query = st.db.escape(Token) + ', ' +st.db.escape(Title) + ',' + st.db.escape(FromName) + ',' + st.db.escape(FromEmailID)
                            + ',' + st.db.escape(CCMailIDS) + ',' + st.db.escape(BCCMailIDS) + ',' + st.db.escape(Subject)
                            + ',' + st.db.escape(Body)+ ',' + st.db.escape(templateType)+ ',' + st.db.escape(tid);

                        console.log('CALL pSaveMailTemplate(' + query + ')');
                        st.db.query('CALL pSaveMailTemplate(' + query + ')', function (err, InsertResult) {
                           // console.log(InsertResult);
                            if (!err){
                                if (InsertResult) {
                                    if (InsertResult.affectedRows > 0) {
                                        RtnMessage.IsSuccessfull = true;
                                        res.send(RtnMessage);
                                        console.log('FnSaveMailTemplate: Mail Template save successfully');
                                    }
                                    else {
                                        console.log('FnSaveMailTemplate:No save  Mail Template');
                                        res.send(RtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnSaveMailTemplate:No save  Mail Template');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveMailTemplate: error in saving  Mail Template' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveMailTemplate: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveMailTemplate:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (!Token) {
                console.log('FnSaveMailTemplate: Token is empty');
            }
            else if (Title == null) {
                console.log('FnSaveMailTemplate: Title is empty');
            }
            else if (Body == null) {
                console.log('FnSaveMailTemplate: Body is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveMailTemplate:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Audit.prototype.getMailTemplate = function(req,res,next) {
    /**
     * @todo FnGetTemplateList
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var templateType = req.query.template_type; //TemplateType=1 for bulkmailer and 2=jobseekers bulkmailer, 3-notification

        if (Token) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        st.db.query('CALL pgetAllMailtemplate(' + st.db.escape(Token) + ',' + st.db.escape(templateType) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0]) {
                                        if (GetResult[0].length > 0) {

                                            console.log('FnGetTemplateList: Template list Send successfully');
                                            res.send(GetResult[0]);
                                        }
                                        else {
                                            console.log('FnGetTemplateList:No Template list found');
                                            res.json(null);
                                        }
                                    }
                                    else {
                                        console.log('FnGetTemplateList:No Template list found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetTemplateList:No Template list found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetTemplateList: error in getting Template list' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetTemplateList: Invalid Token');
                    }
                } else {
                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetTemplateList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!Token) {
                console.log('FnGetTemplateList: Token is empty');
            }
            res.statusCode = 400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetTemplateList error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Audit.prototype.getTemplateDetails = function(req,res,next){
    /**
     * @todo FnGetTemplateDetails
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var TID = req.query.TID;

        if (Token) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        //var query = st.db.escape(Token) + ', ' +st.db.escape(TID);
                        st.db.query('CALL pgetMailtemplateDetails(' + st.db.escape(TID) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0]) {
                                        if (GetResult[0].length > 0) {
                                            console.log('FnGetTemplateDetails: Template Details Send successfully');
                                            res.send(GetResult[0]);
                                        }
                                        else {
                                            console.log('FnGetTemplateDetails:No Template Details found');
                                            res.json(null);
                                        }
                                    }
                                    else {
                                        console.log('FnGetTemplateDetails:No Template Details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetTemplateDetails:No Template Details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetTemplateDetails: error in getting Template Details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetTemplateDetails: Invalid Token');
                    }
                } else {
                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetTemplateDetails: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!Token) {
                console.log('FnGetTemplateDetails: Token is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetTemplateDetails error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Audit.prototype.sendBulkMailer = function(req,res,next){
    /**
     * @todo FnSendBulkMailer
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var TID = req.body.TID;
        var TemplateID = req.body.TemplateID;
        var Attachment = req.body.Attachment;
        var AttachmentFileName = req.body.AttachmentFileName;
        var ToMailID = req.body.ToMailID;
        var OutputFileName='';
        if (TID == '')
            TID = null;

        var RtnResponse = {
            IsSent: false
        };
        if (TID != null) {

            if (Token && TID && TemplateID ) {
                st.validateToken(Token, function (err, tokenResult) {
                    if (!err) {
                        if (tokenResult) {
                            //var query = st.db.escape(Token) + ', ' +st.db.escape(TID);
                            var query = 'Select FirstName, LastName, CompanyName,ifnull(SalesMailID," ") as SalesMailID from tmaster where TID in (' + TID + ')';
                            console.log(query);
                            st.db.query(query, function (err, GetResult) {
                                if (!err) {
                                    if (GetResult) {

                                        //console.log(GetResult[0]);

                                        if (GetResult.length > 0) {
                                            var templateQuery = 'Select * from mmailtemplate where TID = ' + st.db.escape(TemplateID);
                                            st.db.query(templateQuery, function (err, TemplateResult) {
                                                if (!err) {
                                                    if (TemplateResult) {
                                                        if (TemplateResult.length > 0) {
                                                           // console.log(TemplateResult);
                                                            RtnResponse.IsSent = true;
                                                            for (var i = 0; i < GetResult.length; i++) {
                                                                if (GetResult[i].SalesMailID != null && GetResult[i].SalesMailID != ' ') {

                                                                    var mailOptions = {
                                                                        replyto: (TemplateResult[0].FromMailID != 'undefined') ? TemplateResult[0].FromMailID : " ",
                                                                        to: GetResult[i].SalesMailID,
                                                                        subject: TemplateResult[0].Subject,
                                                                        html: TemplateResult[0].Body // html body
                                                                    };
                                                                    mailOptions.html = mailOptions.html.replace("[FirstName]", GetResult[0].FirstName);
                                                                    mailOptions.html = mailOptions.html.replace("[LastName]", GetResult[0].LastName);
                                                                    mailOptions.html = mailOptions.html.replace("[CompanyName]", GetResult[0].CompanyName);


                                                                    var email = new sendgrid.Email();
                                                                    email.from = mailOptions.replyto;
                                                                    email.to = mailOptions.to;
                                                                    email.subject = mailOptions.subject;
                                                                    email.html = mailOptions.html;


                                                                    console.log('send grid......');

                                                                    sendgrid.send(email, function (err, result) {
                                                                        console.log(err);
                                                                        if (!err) {
                                                                            var post = {
                                                                                MessageType: 9,
                                                                                Priority: 5,
                                                                                ToMailID: mailOptions.to,
                                                                                Subject: mailOptions.subject,
                                                                                Body: mailOptions.html,
                                                                                Replyto: mailOptions.replyto,
                                                                                SentStatus: 1
                                                                            };

                                                                            //console.log(post);
                                                                            var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                                                // Neat!
                                                                                if (!err) {
                                                                                    console.log(result);
                                                                                    console.log('FnSendBulkMailer: Mail saved Successfully');

                                                                                    //CallBack(null, RtnMessage);
                                                                                }
                                                                                else {
                                                                                    console.log('FnSendBulkMailer: Mail not Saved Successfully');
                                                                                    // CallBack(null, null);
                                                                                }
                                                                            });
                                                                        }
                                                                        else {
                                                                            console.log('FnSendBulkMailer: Mail not send Successfully');
                                                                            // CallBack(null, null);
                                                                        }
                                                                    });
                                                                    //console.log('FnSendBulkMailer:Mail details sent for processing');
                                                                    //console.log(mailOptions);
                                                                }
                                                                else {
                                                                    console.log('FnSendBulkMailer:Sales Mail Id is empty');
                                                                    //res.json(null);
                                                                }
                                                            }
                                                            res.send(RtnResponse);

                                                        }
                                                        else {
                                                            console.log('FnGetTemplateDetails:No Template Details found');
                                                            res.json(null);
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnGetTemplateDetails:No Template Details found');
                                                        res.json(null);
                                                    }
                                                }
                                                else {
                                                    console.log('FnGetTemplateDetails:Error in getting template ' + err);
                                                    res.json(null);
                                                }
                                            });
                                        }
                                        else {
                                            console.log('FnGetTemplateDetails:User Details not available');
                                            res.json(null);
                                        }
                                    }
                                    else {
                                        console.log('FnGetTemplateDetails:No User Details not available');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetTemplateDetails: User Details not available' + err);
                                    res.statusCode = 500;
                                    res.json(null);
                                }
                            });
                        }
                        else {
                            res.statusCode = 401;
                            res.json(null);
                            console.log('FnSendBulkMailer: Invalid Token');
                        }
                    } else {
                        res.statusCode = 500;
                        res.json(null);
                        console.log('FnSendBulkMailer: Error in validating token:  ' + err);
                    }
                });
            }
            else{
                if (!Token) {
                    console.log('FnSendBulkMailer: Token is empty');
                }
                else if (!TID) {
                    console.log('FnSendBulkMailer: TID is empty');
                }
                else if (!TemplateID) {
                    console.log('FnSendBulkMailer: TemplateID is empty');
                }
            }
        }
        else {
            var fs = require('fs');

            if (Token && Attachment != null && AttachmentFileName != null && ToMailID != null) {
                st.validateToken(Token, function (err, tokenResult) {
                    if (!err) {
                        if (tokenResult) {
                            var query = st.db.escape(Token) + ',' + st.db.escape(DBSecretKey) ;
                            console.log('CALL pSendMailerDetails(' + query + ')');
                            st.db.query('CALL pSendMailerDetails(' + query + ')', function (err, MailerDetails) {
                                if (!err) {
                                    if (MailerDetails) {
                                        if (MailerDetails.length > 0) {
                                            var output = MailerDetails[0];
                                            OutputFileName = output[0].Name;
                                            var EZEID = output[0].EZEID;

                                            console.log(OutputFileName + '.pdf');
                                            console.log('FnSendBulkMailer:UserDetails found..');

                                        }
                                        else{
                                            console.log('FnSendBulkMailer:No EZEID NAME found..');

                                        }
                                    }
                                    else{
                                        console.log('FnSendBulkMailer:No EZEID NAME found..');

                                    }
                                }
                                else{
                                    console.log('FnSendBulkMailer:Error in finding EZEID NAME');

                                }
                                var path = require('path');
                                var file = path.join(__dirname,'../../mail/templates/LocationMapTemplate.html');

                                fs.readFile(file, "utf8", function (err, data) {

                                    if (!err){
                                        data = data.replace("[EZEIDNAME]", OutputFileName);
                                        data = data.replace("[EZEID]", EZEID);
                                        console.log('FnSendBulkMailer:Replace name send successfully');
                                    }
                                    else
                                    {
                                        console.log('FnSendBulkMailer:Error in getting template file');
                                    }

                                    var pdfDocument = require('pdfkit');
                                    //var doc = new pdfDocument();
                                    var doc = new pdfDocument({
                                        size: 'A1',
                                        layout: 'portrait'
                                    });

                                    var bufferData = new Buffer(Attachment.replace(/^data:image\/(png|gif|jpeg|jpg);base64,/, ''), 'base64');
                                    var pdfdoc = doc.image(bufferData);
                                    //console.log(bufferData);

                                    var ws = fs.createWriteStream('./TempMapLocationFile/'+OutputFileName+'.pdf');
                                    var stream = doc.pipe(ws);
                                    doc.end();

                                    doc.on('end',function(){
                                        stream.end();
                                    });

                                    stream.on('end',function(){
                                        stream.close();
                                    });

                                    stream.on('close',function(){
                                        fs.exists('./TempMapLocationFile/'+OutputFileName+'.pdf', function (exists) {

                                            if (exists) {
                                                var bufferPdfDoc = fs.readFileSync('./TempMapLocationFile/' + OutputFileName + '.pdf');
                                                console.log(bufferPdfDoc);
                                                // convert binary data to base64 encoded string
                                                var Base64PdfData = new Buffer(bufferPdfDoc).toString('base64');
                                                //console.log(Base64PdfData);
                                                //fs.writeFileSync('base64.txt', Base64PdfData);
                                                //fs.unlinkSync('TempMapLocationFile/' + OutputFileName + '.pdf');
                                                var file = 'TempMapLocationFile/' + OutputFileName + '.pdf';
                                                console.log('successfully deleted TempMapLocationFile/' + OutputFileName + '.pdf');

                                                var mailOptions = {
                                                    from : 'noreply@ezeone.com',
                                                    to: ToMailID,
                                                    subject: 'Route Map',
                                                    html: data, // html body
                                                    Attachment: Base64PdfData,
                                                    AttachmentFileName: OutputFileName + '.pdf'
                                                };

                                                var email = new sendgrid.Email();
                                                email.from = mailOptions.from;
                                                email.to = mailOptions.to;
                                                email.subject = mailOptions.subject;
                                                email.html = mailOptions.html;
                                                email.addFile({
                                                    filename: mailOptions.AttachmentFileName,
                                                    content:  mailOptions.Attachment
                                                });
                                                //email.files(file);

                                                sendgrid.send(email, function (err, result) {
                                                    console.log(err);

                                                    if (!err) {

                                                        console.log('FnSendBulkMailer: Map send Successfully');
                                                        RtnResponse.IsSent = true;
                                                        res.send(RtnResponse);

                                                        var post = {
                                                            MessageType: 10,
                                                            Priority: 5,
                                                            ToMailID: mailOptions.to,
                                                            Subject: mailOptions.subject,
                                                            Body: mailOptions.html,
                                                            Attachment: mailOptions.Attachment,
                                                            AttachmentFileName: mailOptions.AttachmentFileName
                                                        };

                                                        var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                            // Neat!
                                                            if (!err) {
                                                                //console.log(result);
                                                                console.log('FnSendBulkMailer: Mail saved Successfully');
                                                                //RtnResponse.IsSent = true;
                                                                //res.send(RtnResponse);
                                                            }
                                                            else {
                                                                console.log('FnSendBulkMailer: Mail not Saved Successfully');
                                                                res.send(RtnResponse);
                                                            }
                                                        });
                                                    }
                                                    else{
                                                        console.log('FnSendBulkMailer: Mail not Saved Successfully');
                                                        RtnResponse.IsSent = false;
                                                        res.send(RtnResponse);

                                                    }
                                                });
                                            }
                                            else {
                                                res.json(null);
                                            }
                                        });

                                    });
                                });
                            });
                        }
                        else {
                            res.statusCode = 401;
                            res.json(null);
                            console.log('FnSendBulkMailer: Invalid Token');
                        }
                    } else {
                        res.statusCode = 500;
                        res.json(null);
                        console.log('FnSendBulkMailer: Error in validating token:  ' + err);

                    }
                });
            }

            else {
                if (!Token) {
                    console.log('FnSendBulkMailer: Token is empty');
                }
                else if (ToMailID == null) {
                    console.log('FnSendBulkMailer: ToMailID is empty');
                }
                else if (Attachment == null) {
                    console.log('FnSendBulkMailer: Attachment is empty');
                }
                else if (AttachmentFileName == null) {
                    console.log('FnSendBulkMailer: AttachmentFileName is empty');
                }
                res.statusCode = 400;
                res.json(null);
            }
        }
    }
    catch (ex) {
        console.log('FnSendBulkMailer error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};


module.exports = Audit;