/**
 *  @author Gowri shankar
 *  @since June 30,2015 02:42 PM IST
 *  @title White list and black list module
 *  @description Handles white and black list module functions
 *
 */
"use strict";

function User(db){
    this.db = db;
};


/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.saveList = function(req,res,next){
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
User.prototype.getList = function(req,res,next){
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
User.prototype.deleteList = function(req,res,next){
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
User.prototype.getListCount = function(req,res,next){
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
User.prototype.getRelation = function(req,res,next){
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


module.exports = List;