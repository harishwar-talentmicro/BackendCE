/**
 *  @author Gowri Shankar
 *  @since July o6,2015 12:24 AM IST
 *  @title ID Card module
 *  @description Handles functions related to ID Card module
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

function IDCard_AP(db){
    this.db = db;
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
IDCard_AP.prototype.updateIdCardPrintAP = function(req,res,next){
    /**
     * @todo FnUpdateIdCardPrintAP
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.body.Token;
        var EZEID =req.body.EZEID;

        var RtnMessage = {
            IsUpdated: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token != null && EZEID != null) {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = _this.db.escape(EZEID) + ',' + _this.db.escape(Token);
                        _this.db.query('CALL pUpdateIDCardAP(' + query + ')', function (err, UpdateIdResult) {
                            if (!err){
                                if (UpdateIdResult.affectedRows > 0) {
                                    RtnMessage.IsUpdated = true;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateIdCardPrintAP:Id card details Update successfully');
                                }
                                else {
                                    console.log('FnUpdateIdCardPrintAP:Id card details Update failed');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnUpdateIdCardPrintAP: error in Updating Id card detailsAP' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnUpdateIdCardPrintAP: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnUpdateIdCardPrintAP:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (Token == null) {
                console.log('FnUpdateIdCardPrintAP: Token is empty');
            }
            else if (EZEID == null) {
                console.log('FnUpdateIdCardPrintAP: Ezeid is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnUpdateIdCardPrintAP:error ' + ex.description);

    }
};


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
IDCard_AP.prototype.getIdCardPrintAP = function(req,res,next){
    /**
     * @todo FnGetIdCardPrintAP
     */
    var _this = this;

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.Token;
        var EZEID = req.query.EZEID;
        if (Token != null && EZEID != null) {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        _this.db.query('CALL pGetIDCardDetailsAP(' + _this.db.escape(EZEID) + ')', function (err, SecLocationResult) {
                            if (!err) {
                                if (SecLocationResult != null) {
                                    if (SecLocationResult[0].length > 0) {
                                        console.log('FnGetIdCardPrintAP: ID Card details Sent successfully');
                                        res.send(SecLocationResult[0]);
                                    }
                                    else {
                                        console.log('FnGetIdCardPrintAP:No ID Card Details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetIdCardPrintAP:No ID Card Details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetIdCardPrintAP: error in getting ID Card DetailsAP' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetIdCardPrintAP: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetIdCardPrintAP: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetIdCardPrintAP: Token is empty');
            }
            else if (EZEID == null) {
                console.log('FnGetIdCardPrintAP: EZEID is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetEZEIDDetailsAP error:' + ex.description);

    }
};


module.exports = IDCard_AP;
