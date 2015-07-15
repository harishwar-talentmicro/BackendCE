/**
 *  @author Gowri Shankar
 *  @since July o6,2015 12:24 AM IST
 *  @title Location module
 *  @description Handles functions related to location module
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

var st = null;

function Location_AP(db,stdLib){

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
Location_AP.prototype.getSecondaryLocationListAP = function(req,res,next){
    /**
     * @todo FnGetSecondaryLocationListAP
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var Ezeid = alterEzeoneId(req.query.EZEID);

        if (Token != null && Ezeid != null) {
            st.validateTokenAp(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var Query = 'select TID,LocTitle from tlocations where SeqNo>0 and  EZEID=' + st.db.escape(Ezeid);
                        st.db.query(Query, function (err, Result) {
                            if (!err) {
                                if (Result.length > 0) {
                                    console.log("FnGetSecondaryLocationList: Location send successfully");
                                    res.send(Result);
                                }
                                else
                                {
                                    console.log("FnGetSecondaryLocationList: Location send failed");
                                    res.json(null);
                                }
                            }
                            else
                            {
                                res.statusCode=500;
                                res.json(null);
                                console.log('FnGetSecondaryLocationList: error in getting secondary location list'+err);
                            }
                        });

                    }
                    else {
                        res.statusCode=401;
                        console.log('FnGetSecondaryLocationList: Invalid Token')
                        res.json(null);
                    }
                }
                else {
                    res.statusCode=500;
                    console.log('FnGetSecondaryLocationList: Error in processing Token' + err);
                    res.json(null);
                }
            });
        }
        else
        {
            res.statusCode=400;
            res.json(null);
            if(Token == null){
                console.log('FnGetSecondaryLocationList: token is empty');
            }
            else if(Ezeid == null) {
                console.log('FnGetSecondaryLocationList: Ezeid is empty');
            }

            console.log('FnGetSecondaryLocationList: Mandatory field is empty');

        }
    }
    catch (ex) {
	var errorDate = new Date();
	console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnGetSecondaryLocationList:' + ex.description);

    }
}

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Location_AP.prototype.getSecondaryLocationAP = function(req,res,next){
    /**
     * @todo FnGetSecondaryLocationAP
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var Ezeid = alterEzeoneId(req.query.EZEID);
        var Locid = req.query.LocID;

        if (Token != null && Ezeid != null && Locid!=null) {
            st.validateTokenAp(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var Query = 'select TID, ifnull(LocTitle,"") as LocTitle, Latitude, Longitude, Picture, PictureFileName, Rating from tlocations where SeqNo > 0 and  EZEID=' + st.db.escape(Ezeid) +' and TID = ' + st.db.escape(Locid);
                        st.db.query(Query, function (err, Result) {
                            if (!err) {
                                if (Result.length > 0) {
                                    console.log("FnGetSecondaryLocationListAP:Location send successfully");
                                    res.send(Result);
                                }
                                else
                                {
                                    console.log("FnGetSecondaryLocationListNew:Location send failed");
                                    res.json(null);
                                }
                            }
                            else
                            {
                                res.statusCode=500;
                                res.json(null);
                                console.log('FnGetSecondaryLocationAP: error in getting secondary locationAP'+err);
                            }
                        });
                    }
                    else {
                        res.statusCode=401;
                        console.log('FnGetSecondaryLocationAP: Invalid Token')
                        res.json(null);
                    }
                }
                else {
                    res.statusCode=500;
                    console.log('FnGetSecondaryLocationAP: Error in processing Token' + err);
                    res.json(null);
                }
            });
        }
        else
        {
            res.statusCode=400;
            res.json(null);
            if(Token == null){
                console.log('FnGetSecondaryLocationAP: token is empty');
            }
            else if(Ezeid == null) {
                console.log('FnGetSecondaryLocationAP: Ezeid is empty');
            }
            else if(Locid == null) {
                console.log('FnGetSecondaryLocationAP: Locationid is empty');
            }

            console.log('FnGetSecondaryLocationAP: Mandatory field is empty');

        }
    }
    catch (ex) {
	var errorDate = new Date();
	console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnGetSecondaryLocationAP:' + ex.description);

    }
}

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Location_AP.prototype.updateSecondaryLocationAP = function(req,res,next){
    /**
     * @todo FnUpdateSecondaryLocationAP
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.body.Token;
        var Locid =req.body.LocID;
        var LocTitle = req.body.LocTitle;
        var Latitude = parseFloat(req.body.Latitude);
        var Longitude = parseFloat(req.body.Longitude);
        var Picture = req.body.Picture;
        var PictureFileName = req.body.PictureFileName;
        var Rating =req.body.Rating;
        var RtnMessage = {
            IsUpdated: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token != null && Locid != null && LocTitle != null && Longitude.toString() != 'NaN' && Latitude.toString() != 'NaN' && Picture != null && PictureFileName!=null && Rating != null ) {
            st.validateTokenAp(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = st.db.escape(Locid) + ',' + st.db.escape(LocTitle) + ',' + st.db.escape(Picture) + ',' + st.db.escape(PictureFileName) + ',' + st.db.escape(Latitude) + ',' + st.db.escape(Longitude) + ',' + st.db.escape(Rating);
                        st.db.query('CALL pUpdateSecondaryLocationAP(' + query + ')', function (err, UpdateResult) {
                            if (!err){
                                if (UpdateResult.affectedRows > 0) {
                                    RtnMessage.IsUpdated = true;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateSecondaryLocationAP:Update successfully');
                                }
                                else {
                                    console.log('FnUpdateSecondaryLocationAP:Update failed');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnUpdateSecondaryLocationAP: error in Updating secondary LocationAP' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnUpdateSecondaryLocationAP: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnUpdateSecondaryLocationAP:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (Token == null) {
                console.log('FnUpdateSecondaryLocationAP: Token is empty');
            }
            else if (Locid == null) {
                console.log('FnUpdateSecondaryLocationAP: Locid is empty');
            }
            else if (LocTitle == null) {
                console.log('FnUpdateSecondaryLocationAP: LocTitle is empty');
            }
            else if (Latitude.toString() == 'NaN') {
                console.log('FnUpdateSecondaryLocationAP: latitude is empty');
            }
            else if (Longitude.toString() == 'NaN') {
                console.log('FnUpdateSecondaryLocationAP: longitude is empty');
            }
            else if(Picture == null) {
                console.log('FnUpdateSecondaryLocationAP: Picture is empty');
            }
            else if(PictureFileName == null) {
                console.log('FnUpdateSecondaryLocationAP: PictureFileName is empty');
            }
            else if(Rating == null) {
                console.log('FnUpdateSecondaryLocationAP: Rating is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
	var errorDate = new Date();
	console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnUpdateSecondaryLocationAP:' + ex.description);

    }
}

module.exports = Location_AP;
