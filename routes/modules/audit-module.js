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

function Audit(db){
    this.db = db;
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
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.TokenNo;
        var Page = parseInt(req.query.Page);

        if (Token != null && Page.toString() != 'NaN' && Page.toString() != '0') {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        var ToPage = 25 * Page;
                        var FromPage = ToPage - 24;

                        if (FromPage <= 1) {
                            FromPage = 0;
                        }

                        _this.db.query('CALL pAccessHistory(' + _this.db.escape(Token) + ',' + _this.db.escape(FromPage) + ',' + _this.db.escape(ToPage) + ')', function (err, AccessHistoryResult) {
                            if (!err) {
                                //    console.log(AccessHistoryResult);
                                if (AccessHistoryResult[0]) {
                                    if (AccessHistoryResult[0].length > 0) {
                                        res.send(AccessHistoryResult[0]);
                                        console.log('FnGetAccessHistory: History sent successfully');
                                    }
                                    else {
                                        console.log('FnGetAccessHistory: History not available');
                                        res.json(null);
                                    }

                                }
                                else {
                                    console.log('FnGetAccessHistory: No History available');
                                    res.json(null);
                                }
                            }
                            else {
                                res.json(null);
                                console.log('FnGetAccessHistory: Error in sending documents: ' + err);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        console.log('FnGetAccessHistory: Invalid Token');
                        res.json(null);
                    }
                }
                else {
                    res.statusCode = 500;
                    console.log('FnGetAccessHistory: Token error: ' + err);
                    res.json(null);
                }
            });

        }
        else {
            if (Token == null) {
                console.log('FnGetAccessHistory: Token is empty');
            }
            else if (Page.toString() != 'NaN') {
                console.log('FnGetAccessHistory: Type is empty');
            }
            res.statusCode = 400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnGetAccessHistory error:' + ex.description);
           
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
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var List = req.body.List;
        var RelationType =parseInt(req.body.RelationType);
        var Tag = parseInt(req.body.Tag);
        var EZEID = req.body.EZEID;
        var Token = req.body.Token;

        var RtnMessage = {
            IsSuccessfull: false
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (List!= null && RelationType.toString() != 'NaN' && Tag.toString() != 'NaN' && EZEID !=null && Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = _this.db.escape(List) + ',' + _this.db.escape(RelationType) + ',' + _this.db.escape(EZEID) + ',' + _this.db.escape(Tag) + ',' +_this.db.escape(Token);
                        _this.db.query('CALL pSavewhiteblacklist(' + query + ')', function (err, InsertResult) {
                            if (!err){
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
            else if (RelationType == 'NaN') {
                console.log('FnSaveWhiteBlackList: RelationType is empty');
            }
            else if (EZEID == null) {
                console.log('FnSaveWhiteBlackList: Ezeid is empty');
            }
            else if (Tag == 'NaN') {
                console.log('FnSaveWhiteBlackList: Tag is empty');
            }
            else if (Token == null) {
                console.log('FnSaveWhiteBlackList: Token is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveWhiteBlackList:error ' + ex.description);

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
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        //var EZEID = req.query.EZEID;


        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        _this.db.query('CALL pGetwhiteblacklist(' + _this.db.escape(Token) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
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
        console.log('FnGetWhiteBlackList error:' + ex.description);

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
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");


        var Token = req.body.Token;
        var TID = req.body.TID;

        var RtnMessage = {
            IsSuccessfull: false
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (TID !=null && Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = _this.db.escape(Token) + ',' + _this.db.escape(TID);
                        _this.db.query('CALL pDeletewhiteblacklist(' + query + ')', function (err, InsertResult) {
                            if (!err){
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
            if (Token == null) {
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
        console.log('FnDeleteWhiteBlackList:error ' + ex.description);

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
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var EZEID = req.query.EZEID;
        var List=req.query.List;
        var RtnMessage = {
            WhiteListCount : 0
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (Token != null && EZEID != null && List != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = _this.db.escape(Token) + ',' + _this.db.escape(EZEID) + ',' + _this.db.escape(List);

                        _this.db.query('CALL pGetWhiteListCount(' + query + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult[0] != null) {
                                    if (GetResult[0].length > 0) {
                                        var WhiteListCount =GetResult[0];
                                        RtnMessage.WhiteListCount=WhiteListCount[0].WhiteListCount;
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
            if (Token == null) {
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
        console.log('FnGetWhiteListCount error:' + ex.description);

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
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        if (LangID.toString != 'NaN') {
            var Query = 'Select RelationID, RelationshipTitle from mrelationtype where LangID=' + _this.db.escape(LangID);
            _this.db.query(Query, function (err, RelationTypeResult) {
                if (!err) {
                    if (RelationTypeResult.length > 0) {
                        res.send(RelationTypeResult);
                        console.log('FnGetRelationType: mrelationtype: Relation Type sent successfully');
                    }
                    else {
                        res.json(null);
                        res.statusCode = 500;
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
        console.log('FnGetRelationType error:' + ex.description);

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
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var Title = req.body.Title;
        var FromName = req.body.FromName;
        var FromEmailID = req.body.FromEmailID;
        var CCMailIDS = req.body.CCMailIDS;
        var BCCMailIDS = req.body.BCCMailIDS;
        var Subject  = req.body.Subject;
        var Body = req.body.Body;

        var RtnMessage = {
            IsSuccessfull: false
        };

        if (Token != null && Title != null && FromName != null && FromEmailID != null && Subject != null && Body != null ) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = _this.db.escape(Token) + ', ' +_this.db.escape(Title) + ',' + _this.db.escape(FromName) + ',' + _this.db.escape(FromEmailID)
                            + ',' + _this.db.escape(CCMailIDS) + ',' + _this.db.escape(BCCMailIDS) + ',' + _this.db.escape(Subject) + ',' + _this.db.escape(Body);
                        _this.db.query('CALL pSaveMailTemplate(' + query + ')', function (err, InsertResult) {
                            if (!err){
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
            if (Token == null) {
                console.log('FnSaveMailTemplate: Token is empty');
            }
            else if (Title == null) {
                console.log('FnSaveMailTemplate: Title is empty');
            }
            else if (FromName == null) {
                console.log('FnSaveMailTemplate: FromName is empty');
            }
            else if (FromEmailID == null) {
                console.log('FnSaveMailTemplate: FromEmailID is empty');
            }
            else if (Subject == null) {
                console.log('FnSaveMailTemplate: Subject is empty');
            }
            else if (Body == null) {
                console.log('FnSaveMailTemplate: Body is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveMailTemplate:error ' + ex.description);

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
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;

        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        _this.db.query('CALL pgetAllMailtemplate(' + _this.db.escape(Token) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
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
            if (Token == null) {
                console.log('FnGetTemplateList: Token is empty');
            }
            res.statusCode = 400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetTemplateList error:' + ex.description);

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
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var TID = req.query.TID;

        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        //var query = _this.db.escape(Token) + ', ' +_this.db.escape(TID);
                        _this.db.query('CALL pgetMailtemplateDetails(' + _this.db.escape(TID) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
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
            if (Token == null) {
                console.log('FnGetTemplateDetails: Token is empty');
            }
            else if (TID == null) {
                console.log('FnGetTemplateDetails: TID is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetTemplateDetails error:' + ex.description);

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
    var _this = this;
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

            if (Token != null && Token != '' && TID != null && TID != '' && TemplateID != null && TemplateID != '') {
                FnValidateToken(Token, function (err, Result) {
                    if (!err) {
                        if (Result != null) {
                            //var query = _this.db.escape(Token) + ', ' +_this.db.escape(TID);
                            var query = 'Select FirstName, LastName, CompanyName,ifnull(SalesMailID," ") as SalesMailID from tmaster where TID in (' + TID + ')';
                            console.log(query);
                            _this.db.query(query, function (err, GetResult) {
                                if (!err) {
                                    if (GetResult != null) {

                                        console.log(GetResult[0]);

                                        if (GetResult.length > 0) {
                                            var templateQuery = 'Select * from mmailtemplate where TID = ' + _this.db.escape(TemplateID);
                                            _this.db.query(templateQuery, function (err, TemplateResult) {
                                                if (!err) {
                                                    if (TemplateResult != null) {
                                                        if (TemplateResult.length > 0) {
                                                            console.log(TemplateResult);
                                                            RtnResponse.IsSent = true;
                                                            for (var i = 0; i < GetResult.length; i++) {
                                                                if (GetResult[i].SalesMailID != null && GetResult[i].SalesMailID != ' ') {

                                                                    var mailOptions = {
                                                                        replyto: (TemplateResult[0].FromMailID != 'undefined') ? TemplateResult[0].FromMailID : " ",
                                                                        to: GetResult[i].SalesMailID,
                                                                        subject: TemplateResult[0].Subject,
                                                                        html: TemplateResult[0].Body, // html body
                                                                    };
                                                                    mailOptions.html = mailOptions.html.replace("[FirstName]", GetResult[0].FirstName);
                                                                    mailOptions.html = mailOptions.html.replace("[LastName]", GetResult[0].LastName);
                                                                    mailOptions.html = mailOptions.html.replace("[CompanyName]", GetResult[0].CompanyName);

                                                                    //console.log(mailOptions.html);
                                                                    var post = {
                                                                        MessageType: 9,
                                                                        Priority: 5,
                                                                        ToMailID: GetResult[i].SalesMailID,
                                                                        Subject: mailOptions.subject,
                                                                        Body: mailOptions.html,
                                                                        Replyto: mailOptions.replyto
                                                                    };

                                                                    //console.log(post);
                                                                    var query = _this.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
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
                                                                    console.log('FnSendBulkMailer:Mail details sent for processing');
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
                if (Token == null) {
                    console.log('FnSendBulkMailer: Token is empty');
                }
                else if (TID == null) {
                    console.log('FnSendBulkMailer: TID is empty');
                }
                else if (TemplateID == null) {
                    console.log('FnSendBulkMailer: TemplateID is empty');
                }
            }
        }
        else {
            var fs = require('fs');

            if (Token != null && Attachment != null && AttachmentFileName != null && ToMailID != null) {
                FnValidateToken(Token, function (err, Result) {
                    if (!err) {
                        if (Result != null) {
                            var query = _this.db.escape(Token);
                            console.log('CALL pSendMailerDetails(' + query + ')');
                            _this.db.query('CALL pSendMailerDetails(' + query + ')', function (err, Result) {

                                if (!err) {
                                    if (Result.length > 0) {
                                        var output = Result[0];
                                        OutputFileName = output[0].Name;
                                        var EZEID = output[0].EZEID;

                                        console.log(OutputFileName+'.pdf');
                                        console.log('FnSendBulkMailer:UserDetails found..');

                                    }
                                    else{
                                        console.log('FnSendBulkMailer:No EZEID NAME found..');

                                    }
                                }
                                else{
                                    console.log('FnSendBulkMailer:Error in finding EZEID NAME');

                                }
                                fs.readFile("./MailContentTemplate.txt/", "utf8", function (err, data) {
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
                                                var bufferPdfDoc = fs.readFileSync('./TempMapLocationFile/'+OutputFileName+'.pdf');
                                                console.log(bufferPdfDoc);
                                                // convert binary data to base64 encoded string
                                                var Base64PdfData = new Buffer(bufferPdfDoc).toString('base64');
                                                //console.log(Base64PdfData);
                                                //fs.writeFileSync('base64.txt', Base64PdfData);
                                                fs.unlinkSync('TempMapLocationFile/'+OutputFileName+'.pdf');
                                                console.log('successfully deleted TempMapLocationFile/'+OutputFileName+'.pdf');

                                                var mailOptions = {
                                                    To: ToMailID,
                                                    subject: 'Route Map',
                                                    html: data, // html body
                                                    Attachment: Base64PdfData,
                                                    AttachmentFileName: OutputFileName+'.pdf'
                                                };

                                                var post = {
                                                    MessageType: 10,
                                                    Priority: 5,
                                                    ToMailID: mailOptions.To,
                                                    Subject: mailOptions.subject,
                                                    Body: mailOptions.html,
                                                    Attachment: mailOptions.Attachment,
                                                    AttachmentFileName: mailOptions.AttachmentFileName
                                                };

                                                //console.log(post);
                                                var query = _this.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                    // Neat!
                                                    if (!err) {
                                                        //console.log(result);
                                                        console.log('FnSendBulkMailer: Mail saved Successfully');
                                                        RtnResponse.IsSent = true;
                                                        res.send(RtnResponse);
                                                    }
                                                    else {
                                                        console.log('FnSendBulkMailer: Mail not Saved Successfully');
                                                        res.send(RtnResponse);
                                                    }
                                                });

                                                console.log('FnSendBulkMailer:Mail details sent for processing');


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
                if (Token == null) {
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
        console.log('FnSendBulkMailer error:' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Audit.prototype.getMessages = function(req,res,next){
    /**
     * @todo FnGetMessages
     */
    var _this = this;
try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var Token = req.query.TokenNo;
    var Page = parseInt(req.query.Page);
    var Status = req.query.Status;
    var MessageType = req.query.MessageType;
    //console.log(req.query);
    if (Token != null && Page.toString() != 'NaN' && Page.toString() != '0') {
        FnValidateToken(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    var ToPage = 25 * Page;
                    var FromPage = ToPage - 24;

                    if (FromPage <= 1) {
                        FromPage = 0;
                    }
                    //  console.log('From Page: ' + FromPage);
                    //console.log('To Page: ' + ToPage);
                    var getMessageQuery = 'CALL pGetMessages(' + _this.db.escape(Token) + ',' + _this.db.escape(FromPage) + ',' + _this.db.escape(ToPage) + ',' + _this.db.escape(Status) + ',' + _this.db.escape(MessageType) + ')';
                    _this.db.query(getMessageQuery, function (err, MessagesResult) {
                        if (!err) {
                            //  console.log(MessagesResult);
                            if (MessagesResult != null) {
                                if (MessagesResult[0].length > 0) {
                                    res.send(MessagesResult[0]);
                                    console.log('FnGetMessages: Messages sent successfully');
                                }
                                else {
                                    console.log('FnGetMessages: No Messages available');
                                    res.json(null);
                                }

                            }
                            else {
                                console.log('FnGetMessages: No Messages available');
                                res.json(null);
                            }
                        }
                        else {
                            res.statusCode = 500;
                            console.log('FnGetMessages: Error in sending Messages: ' + err);
                            res.json(null);
                        }
                    });
                }
                else {
                    console.log('FnGetMessages: Invalid Token');
                    res.statusCode = 401;
                    res.json(null);
                }
            }
            else {
                res.statusCode = 500;
                console.log('FnGetMessages: Token error: ' + err);
                res.json(null);
            }
        });
    }
    else {
        if (Token == null) {
            console.log('FnGetMessages: Token is empty');
        } else if (Page.toString() == 'NaN') {
            console.log('FnGetMessages: Page is empty');
        }
        else if (Page.toString() == '0') {
            console.log('FnGetMessages: Sending page 0');
        }
        res.statusCode = 400;
        res.json(null);
    }
}
catch (ex) {
    console.log('FnGetMessages error:' + ex.description);

}
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Audit.prototype.updateMessageStatus = function(req,res,next){
    /**
     * @todo FnUpdateMessageStatus
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.body.TokenNo;
        var Status = parseInt(req.body.Status);
        var TID = parseInt(req.body.TID);
        var Notes = req.body.Notes;
        var RtnMessage = {
            IsUpdated: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Notes == null)
            Notes = '';
        if (token != null && token != '' && Status.toString() != 'NaN' && TID.toString() != 'NaN') {
            FnValidateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        //var query = 'update tmessages set Status=' + _this.db.escape(Status) + ' where TID=' + _this.db.escape(TID);
                        var query = 'update ttrans set Status=' + _this.db.escape(Status) + ', Notes=' + _this.db.escape(Notes) + ' where TID=' + _this.db.escape(TID);
                        // console.log('Update query : ' + query);
                        _this.db.query(query, function (err, UpdateResult) {
                            if (!err) {
                                // console.log('FnUpdateMessageStatus: Update result' + UpdateResult);
                                if (UpdateResult.affectedRows > 0) {
                                    RtnMessage.IsUpdated = true;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateMessageStatus: Message status update successfully');
                                }
                                else {
                                    console.log('FnUpdateMessageStatus: Update item is not avaiable');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnUpdateMessageStatus: ' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnUpdateMessageStatus: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    res.statusCode = 500;
                    console.log('FnUpdateMessageStatus: : ' + err);
                    res.send(RtnMessage);

                }
            });

        }
        else {
            if (token == null || token == '') {
                console.log('FnUpdateMessageStatus: token is empty');
            }
            else if (Status.toString() == 'NaN') {
                console.log('FnUpdateMessageStatus: Status is empty');
            }
            else if (TID.toString() != 'NaN') {
                console.log('FnUpdateMessageStatus: TID is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);

        }
    }
    catch (ex) {
        console.log('FnUpdateMessageStatus:  error:' + ex.description);

    }
};

module.exports = Audit;