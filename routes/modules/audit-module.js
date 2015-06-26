/**
 *  @author Indrajeet
 *  @since June 25,2015 11:24 AM IST
 *  @title Audit module
 *  @description Handles functions related to access history, create update and edit records
 *  1. Access History Fetching for EZEID
 *
 */
"use strict";

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
                    if (Result != null) {
                        var ToPage = 25 * Page;
                        var FromPage = ToPage - 24;

                        if (FromPage <= 1) {
                            FromPage = 0;
                        }

                        _this.db.query('CALL pAccessHistory(' + _this.db.escape(Token) + ',' + _this.db.escape(FromPage) + ',' + _this.db.escape(ToPage) + ')', function (err, AccessHistoryResult) {
                            if (!err) {
                                //    console.log(AccessHistoryResult);
                                if (AccessHistoryResult[0] != null) {
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
        throw new Error(ex);
    }
};


module.exports = Audit;