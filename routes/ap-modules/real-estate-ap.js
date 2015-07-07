/**
 *  @author Gowri Shankar
 *  @since July o6,2015 12:24 AM IST
 *  @title RealEstate module
 *  @description Handles functions related to real estate module
 *
 */
"use strict";

var path ='D:\\EZEIDBanner\\';
var EZEIDEmail = 'noreply@ezeid.com';

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

function RealEstate_AP(db){
    this.db = db;
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
RealEstate_AP.prototype.getRealStateDataAP = function(req,res,next){
    /**
     * @todo FnGetRealStateDataAP
     */
    var _this = this;

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var TID = req.query.TID;
        var Token = req.query.Token;

        if(Token != null && TID != null){
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        _this.db.query('CALL pGetRealEstateData(' + _this.db.escape(TID)  + ')', function (err, RealStateResult) {
                            if (!err) {
                                // console.log(PictuerResult);
                                if (RealStateResult != null) {
                                    if (RealStateResult[0].length > 0) {
                                        res.send(RealStateResult[0]);
                                        console.log('FnGetRealStateDataAP: Realstate Data sent successfully');
                                    }
                                    else {
                                        res.json(null);
                                        console.log('FnGetRealStateDataAP:pGetRealEstateData: No real state data found');
                                    }
                                }
                                else {
                                    res.json(null);
                                    console.log('FnGetRealStateDataAP:pGetRealEstateData: No real state data found');
                                }
                            }
                            else {
                                res.statusCode=500;
                                res.json(null);
                                console.log('FnGetRealStateDataAP:pGetRealEstateData:' + err);
                            }
                        });
                    }
                    else
                    {
                        console.log('FnGetRealStateDataAP: Invalid Token');
                        res.statusCode=401;
                        res.json(null);
                    }
                }
                else
                {
                    console.log('FnGetRealStateDataAP: Error in validating token: '+err);
                    res.statusCode=500;
                    res.json(null);
                }
            });
        }
        else
        {
            if (Token == null) {
                console.log('FnGetRealStateDataAP: Token is empty');
            }
            else if (TID == null) {
                console.log('FnGetRealStateDataAP: TID is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch(ex){
        console.log('FnGetRealStateDataAP error: ' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
RealEstate_AP.prototype.searchRealEstateAP = function(req,res,next){
    /**
     * @todo FnSearchRealEstateAP
     */
    var _this = this;

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Status = req.body.Status;
        var Purpose = parseInt(req.body.Purpose);
        var PropertyType = req.body.PropertyType;
        var PrefUser = req.body.PrefUser;
        var SpaceType = req.body.SpaceType;
        var SpaceQtyF = req.body.SpaceQtyFrom;
        var SpaceQtyT = req.body.SpaceQtyTo;
        var RatingFrom = req.body.RatingFrom;
        var RatingTo = req.body.RatingTo;
        var Latitude = req.body.Latitude;
        if (Latitude == null || Latitude == '') {
            Latitude = 0.0;
        }
        var Longitude = req.body.Longitude;
        if (Longitude == null || Longitude == '') {
            Longitude = 0.0;
        }
        var Proximity = req.body.Proximity;
        var AreaUOM = req.body.AreaUOM;
        var AreaFrom = req.body.AreaFrom;
        var AreaTo = req.body.AreaTo;
        var FunishedType = req.body.FunishedType;
        var AmountFrom = req.body.AmountFrom;
        var AmountTo = req.body.AmountTo;
        var Token = req.body.Token;
        var AgeFrom = req.body.AgeFrom;
        var AgeTO = req.body.AgeTO;
        var NoOfBathrooms = req.body.NoOfBathrooms;
        var Gas = req.body.Gas;
        var Lift = req.body.Lift;
        var Gym = req.body.Gym;
        var SwimmingPool = req.body.SwimmingPool;
        var Security = req.body.Security;
        var UPS = req.body.UPS;



        /*if (Status!=null && Purpose.toString() != 'NaN' && PropertyType!=null && PrefUser!=null && SpaceType !=null && SpaceQtyF !=null && SpaceQtyT !=null && RatingFrom !=null
         && RatingTo !=null && Latitude !=null && Longitude !=null && Proximity !=null && AreaUOM !=null && AreaFrom !=null
         && AreaTo !=null && FunishedType !=null && AmountFrom !=null && AmountTo !=null) {*/
        FnValidateTokenAP(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {

                    var SearchQuery = _this.db.escape(Status) + ',' + _this.db.escape(Purpose) + ',' + _this.db.escape(PropertyType) + ',' + _this.db.escape(PrefUser) + ',' +
                        _this.db.escape(SpaceType) + ',' + _this.db.escape(SpaceQtyF) + ',' + _this.db.escape(SpaceQtyT) + ',' + _this.db.escape(RatingFrom) + ',' + _this.db.escape(RatingTo) + ',' +
                        _this.db.escape(Latitude) + ',' + _this.db.escape(Longitude) + ',' + _this.db.escape(Proximity) + ',' +_this.db.escape(AreaUOM) + ',' + _this.db.escape(AreaFrom) + ',' +
                        _this.db.escape(AreaTo) + ',' + _this.db.escape(FunishedType) + ',' + _this.db.escape(AmountFrom) + ',' + _this.db.escape(AmountTo) + ',' +
                        _this.db.escape(AgeFrom) + ',' + _this.db.escape(AgeTO) + ',' + _this.db.escape(NoOfBathrooms) + ',' +
                        _this.db.escape(Gas) + ',' + _this.db.escape(Lift) + ',' + _this.db.escape(Gym) + ',' + _this.db.escape(SwimmingPool)
                        + ',' + _this.db.escape(Security) + ',' + _this.db.escape(UPS);

                    console.log(SearchQuery);

                    _this.db.query('CALL pSearchRealEstateData(' + SearchQuery + ')', function (err, SearchResult) {
                        if (!err) {
                            if (SearchResult[0] != null) {
                                if (SearchResult[0].length > 0) {
                                    res.send(SearchResult[0]);
                                    console.log('FnSearchRealEstateAP:Search result sent successfully');
                                }
                                else {
                                    res.json(null);
                                    console.log('FnSearchRealEstateAP: No search found');
                                }
                            }
                            else {
                                res.json(null);
                                console.log('FnSearchRealEstateAP:No search found');
                            }

                        }
                        else {
                            res.statusCode = 500;
                            res.json(null);
                            console.log('FnSearchRealEstateAP: error in getting search RealEstateData' + err);
                        }
                    });
                }
                else {
                    res.statusCode = 401;
                    console.log('FnSearchRealEstateAP: Invalid token');
                    res.json(null);
                }
            }
            else {
                console.log('FnSearchRealEstateAP: Error in validating token:' + err);
                res.statusCode = 500;
                res.json(null);
            }
        });
    }
    catch (ex) {
        console.log('FnSearchRealEstateAP error:' + ex.description);

    }
};

module.exports = RealEstate_AP;