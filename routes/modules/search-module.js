/**
 *  @author Indrajeet
 *  @since June 25,2015 11:24 AM IST
 *  @title Search module
 *  @description Handles functions related to EZEID search with various parameters
 *  1. Search using keyword and filters
 *  2. Location Information based on TID
 *
 */
"use strict";

function Search(db){
    this.db = db;
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Search.prototype.searchKeyword = function(req,res,next){
    /**
     * @todo FnSearchByKeywords
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var type = parseInt(req.body.SearchType);
        var find = req.body.Keywords;
        var token = req.body.Token;
        var CategoryID = req.body.SCategory;
        var Proximity = parseInt(req.body.Proximity);
        var Latitude = parseFloat(req.body.Latitude);
        var Longitude = parseFloat(req.body.Longitude);
        var ParkingStatus = req.body.ParkingStatus;
        var OpenCloseStatus = req.body.OpenStatus;
        var Rating = req.body.Rating;
        var HomeDelivery = req.body.HomeDelivery;
        var CurrentDate = req.body.CurrentDate;

        if(CurrentDate != null)
            CurrentDate = new Date(CurrentDate);
        if(type.toString() == 'NaN')
            type = 0;

        var isPagination = req.body.isPagination ? parseInt(req.body.isPagination) : 0 ;
        var pagesize = req.body.pagesize ? parseInt(req.body.pagesize) : 0;
        var pagecount = req.body.pagecount ? parseInt(req.body.pagecount) : 0;
        var total = req.body.total ? parseInt(req.body.total) : 0;

        console.log(req.body);

        if (type == "1") {

            if (find != null && find != '' && CategoryID != null && token != null && token != '' && CurrentDate != null && pagesize != null && pagecount != null) {
                FnValidateToken(token, function (err, Result) {
                    if (!err) {
                        if (Result != null) {
                            if(CurrentDate != null)
                                CurrentDate = new Date(CurrentDate);
                            var LocSeqNo = 0;
                            var EZEID, Pin = null;
                            var DocType = '';
                            var FindArray = find.split('.');
                            var SearchType = 0;
                            //console.log('findarray: ' + FindArray.length);
                            console.log(req.ip);


                            var logHistory = {
                                searchTid : 0,  // who is searching
                                ezeid : FindArray[0],
                                ip : req.ip,
                                type : 0
                            };

                            if (FindArray.length > 0) {
                                EZEID = FindArray[0];
                                //checking the fisrt condition
                                if (FindArray.length > 1) {
                                    if (FindArray[1] != '') {
                                        if (FindArray[1].charAt(0).toUpperCase() == 'L') {
                                            LocSeqNo = FindArray[1].toString().substring(1, FindArray[1].length);
                                        }
                                        else if (FindArray[1].toUpperCase() == 'ID') {
                                            SearchType = 2;
                                            DocType = 'ID';
                                            logHistory.type = 3;
                                        }
                                        else if (FindArray[1].toUpperCase() == 'DL') {
                                            SearchType = 2;
                                            DocType = 'DL';
                                            logHistory.type = 7;

                                        }
                                        else if (FindArray[1].toUpperCase() == 'PP') {
                                            SearchType = 2;
                                            DocType = 'PP';
                                            logHistory.type = 4;
                                        }
                                        else if (FindArray[1].toUpperCase() == 'BR') {
                                            SearchType = 2;
                                            DocType = 'BR';
                                            logHistory.type = 1;
                                        }
                                        else if (FindArray[1].toUpperCase() == 'CV') {
                                            SearchType = 2;
                                            DocType = 'CV';
                                            logHistory.type = 2;
                                        }
                                        else if (FindArray[1].toUpperCase() == 'D1') {
                                            SearchType = 2;
                                            DocType = 'D1';
                                            logHistory.type = 5;
                                        }
                                        else if (FindArray[1].toUpperCase() == 'D2') {
                                            SearchType = 2;
                                            DocType = 'D2';
                                            logHistory.type = 6;
                                        }
                                        else {
                                            LocSeqNo = 0;
                                            Pin = FindArray[1];
                                        }
                                        //checking the second condition
                                        if (typeof FindArray[2] != 'undefined') {
                                            Pin = FindArray[2];
                                        }
                                        //checking the final condition
                                    }
                                }
                            }
                            var SearchQuery = db.escape('') + ',' + db.escape(CategoryID) + ',' + db.escape(0) + ',' + db.escape(Latitude)
                                + ',' + db.escape(Longitude) +',' + db.escape(EZEID) + ',' + db.escape(LocSeqNo) + ',' + db.escape(Pin) + ',' + db.escape(SearchType) + ',' + db.escape(DocType)
                                + ',' + db.escape("0") + ',' + db.escape("0") + ',' + db.escape("0") + ',' + db.escape(token)
                                + ',' + db.escape(HomeDelivery) + ',' + db.escape(CurrentDate) + ',' + db.escape(isPagination) + ',' +
                                db.escape(pagesize) + ',' + db.escape(pagecount) + ',' + db.escape(total) ;

                            console.log('CALL pSearchResultNew(' + SearchQuery + ')');
                            db.query('CALL pSearchResultNew(' + SearchQuery + ')', function (err, SearchResult) {
                                // db.query(searchQuery, function (err, SearchResult) {
                                if (!err) {
                                    if (SearchResult[0] != null) {
                                        if (SearchResult[0].length > 0) {
                                            if (SearchResult[0][0].totalcount == 1)
                                            {
                                                res.json({totalcount:SearchResult[0][0].totalcount,Result:SearchResult[1]});
                                                console.log('FnSearchByKeywords: tmaster: Search result sent successfully');
                                            }
                                            else
                                            {
                                                res.send(SearchResult[0]);
                                                console.log('FnSearchByKeywords: tmaster: Search result sent successfully');
                                            }

                                            if (SearchType == 2){
                                                var getQuery = 'select TID from tmaster where Token='+db.escape(token);
                                                db.query(getQuery, function (err, getResult) {
                                                    if(!err){
                                                        var tid = getResult[0].TID;
                                                        console.log(tid);
                                                    }
                                                    var query = db.escape(tid) + ',' + db.escape(logHistory.ezeid) + ',' + db.escape(logHistory.ip) + ',' + db.escape(logHistory.type);
                                                    console.log('CALL pCreateAccessHistory(' + query + ')');
                                                    if(logHistory.type < 1){
                                                        db.query('CALL pCreateAccessHistory(' + query + ')', function (err){
                                                            if(!err){
                                                                console.log('FnSearchByKeywords:Access history is created');
                                                            }
                                                            else {
                                                                console.log('FnSearchByKeywords: tmaster: ' + err);
                                                            }
                                                        });


                                                    }

                                                });
                                            }
                                        }
                                        else {
                                            res.json(null);
                                            console.log('FnSearchByKeywords: tmaster: no search found');
                                        }
                                    }
                                    else {
                                        res.json(null);
                                        console.log('FnSearchByKeywords: tmaster: no search found');
                                    }

                                }
                                else {
                                    res.statusCode = 500;
                                    res.json(null);
                                    console.log('FnSearchByKeywords: tmaster: ' + err);
                                }
                            });

                        }
                        else {
                            res.statusCode = 401;
                            console.log('FnSearchByKeywords: Invalid token');
                            res.json(null);
                        }
                    }
                    else {
                        console.log('FnSearchByKeywords: ' + err);
                        res.statusCode = 500;
                        res.json(null);
                    }
                });

            }
            else {
                if (find == null || find == '') {
                    console.log('FnSearchByKeywords: keyword is empty');
                }
                else if (CategoryID == null || CategoryID == '') {
                    console.log('FnSearchByKeywords: CategoryID is empty');
                }
                else if (token == null || token == '') {
                    console.log('FnSearchByKeywords: token is empty');
                }
                else if (CurrentDate == null || CurrentDate == '') {
                    console.log('FnSearchByKeywords: CurrentDate is empty');
                }
                else if (pagesize == null) {
                    console.log('FnSearchByKeywords: pagesize is empty');
                }
                else if (pagecount == null) {
                    console.log('FnSearchByKeywords: pagecount is empty');
                }
                res.statusCode = 400;
                res.json(null);
            }
        }
        else if (type == "2") {

            if (find != null && find != '' && Proximity.toString() != 'NaN' && Latitude.toString() != 'NaN' && Longitude.toString() != 'NaN' && CategoryID != null && CurrentDate != null && pagesize != null && pagecount != null) {

                if (ParkingStatus == 0) {
                    ParkingStatus = "1,2,3";
                }

                var InsertQuery = db.escape(find) + ',' + db.escape(CategoryID) + ',' + db.escape(Proximity) + ',' + db.escape(Latitude)
                    + ',' + db.escape(Longitude) + ',' + db.escape('') + ',' + db.escape(0) + ',' + db.escape(0) + ',' + db.escape(1)
                    + ',' + db.escape('') + ',' + db.escape(ParkingStatus) + ',' + db.escape(OpenCloseStatus) + ',' + db.escape(Rating)
                    + ',' + db.escape(token) + ',' + db.escape(HomeDelivery)+ ',' + db.escape(CurrentDate) + ',' + db.escape(isPagination) + ',' +
                    db.escape(pagesize) + ',' + db.escape(pagecount)+ ',' + db.escape(total) ;
                console.log('CALL pSearchResultNew(' + InsertQuery + ')');
                //var link = 'CALL pSearchResult(' + InsertQuery + ')';
                db.query('CALL pSearchResultNew(' + InsertQuery + ')', function (err, SearchResult) {
                    if (!err) {
                        //console.log(SearchResult);
                        if (SearchResult[0] != null) {
                            if (SearchResult[0].length > 0) {
                                //res.send(SearchResult[0]);
                                res.json({totalcount:SearchResult[0][0].totalcount,Result:SearchResult[1]});
                                console.log('FnSearchByKeywords:  tmaster:Search Found');
                            }
                            else {
                                res.json(null);
                                console.log('FnSearchByKeywords: tmaster: no search found');
                            }
                        }
                        else {
                            res.json(null);
                            console.log('FnSearchByKeywords:  tmaster: no search found');
                        }
                    }
                    else {
                        res.statusCode = 500;
                        res.json(null);
                        console.log('FnSearchByKeywords:  tmaster: ' + err);
                    }
                });
            }
            else {
                if (find == null || find == '') {
                    console.log('FnSearchByKeywords: keyword is empty');
                }
                else if (CategoryID == null || CategoryID == '') {
                    console.log('FnSearchByKeywords: CategoryID is empty');
                }
                else if (Proximity == 'NaN') {
                    console.log('FnSearchByKeywords: Proximity is empty');
                }
                else if (Latitude == 'NaN') {
                    console.log('FnSearchByKeywords: Proximity is empty');
                }
                else if (Longitude == 'NaN') {
                    console.log('FnSearchByKeywords: Proximity is empty');
                }
                else if (pagesize == null) {
                    console.log('FnSearchByKeywords: pagesize is empty');
                }
                else if (pagecount == null) {
                    console.log('FnSearchByKeywords: pagecount is empty');
                }
                res.statusCode = 400;
                res.json(null);
            }
        }
        else if (type == "3") {

            if (find != null && find != '' && Proximity.toString() != 'NaN' && Latitude.toString() != 'NaN' && Longitude.toString() != 'NaN' && CategoryID != null && CurrentDate != null) {
                if (ParkingStatus == 0) {
                    ParkingStatus = "1,2,3";
                }
                var InsertQuery = db.escape(find) + ',' + db.escape(CategoryID) + ',' + db.escape(Proximity) + ',' + db.escape(Latitude)
                    + ',' + db.escape(Longitude) + ',' + db.escape('') + ',' + db.escape(0) + ',' + db.escape(0) + ',' + db.escape(3)
                    + ',' + db.escape('') + ',' + db.escape(ParkingStatus) + ',' + db.escape(OpenCloseStatus) + ',' + db.escape(Rating)
                    + ',' + db.escape(token)  + ',' + db.escape(HomeDelivery)+ ',' + db.escape(CurrentDate) + ',' + db.escape(isPagination) + ',' +
                    db.escape(pagesize) + ',' + db.escape(pagecount)+ ',' + db.escape(total);
                console.log('CALL pSearchResultNew(' + InsertQuery + ')');
                db.query('CALL pSearchResultNew(' + InsertQuery + ')', function (err, SearchResult) {
                    if (!err) {
                        console.log(SearchResult);
                        if (SearchResult[0] != null) {
                            if (SearchResult[0].length > 0) {
                                //res.send(SearchResult[0]);
                                res.json({totalcount:SearchResult[0][0].totalcount,Result:SearchResult[1]});
                                console.log('FnSearchByKeywords:  tmaster:Search Found');
                            }
                            else {
                                res.json(null);
                                console.log('FnSearchByKeywords: tmaster: no search found');
                            }
                        }
                        else {
                            res.json(null);
                            console.log('FnSearchByKeywords:  tmaster: no search found');
                        }
                    }
                    else {
                        res.statusCode = 500;
                        res.json(null);
                        console.log('FnSearchByKeywords:  tmaster: ' + err);
                    }
                });
            }
            else {
                if (find == null || find == '') {
                    console.log('FnSearchByKeywords: keyword is empty');
                }
                else if (CategoryID == null || CategoryID == '') {
                    console.log('FnSearchByKeywords: CategoryID is empty');
                }
                else if (Proximity == 'NaN') {
                    console.log('FnSearchByKeywords: Proximity is empty');
                }
                else if (Latitude == 'NaN') {
                    console.log('FnSearchByKeywords: Proximity is empty');
                }
                else if (Longitude == 'NaN') {
                    console.log('FnSearchByKeywords: Proximity is empty');
                }
                res.statusCode = 400;
                res.json(null);
            }
        }
        else {
            console.log('FnSearchByKeywords: Invalid Search type');
            res.statusCode = 400;
            res.json(null);
        }


    }
    catch (ex) {
        console.log('FnSearchByKeywords error:' + ex.description);
        throw new Error(ex);
    }

};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Search.prototype.searchInformation = function(req,res,next){
    /**
     * @todo FnGetSearchInformation
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var TID = parseInt(req.query.TID);
        var CurrentDate = req.query.CurrentDate;
        var SearchType = req.query.SearchType;
        var IPAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress ||
        req.socket.remoteAddress || req.connection.socket.remoteAddress);
        var WorkingDate
        var moment = require('moment');
        if(CurrentDate != null)
            var WorkingDate =  moment(new Date(CurrentDate)).format('YYYY-MM-DD HH:MM');
        else
            var WorkingDate = moment(new Date()).format('YYYY-MM-DD HH:MM');
        //console.log(WorkingDate);

        if (Token != null && Token != '' && TID.toString() != 'NaN' && WorkingDate != null) {
            if(Token == 2){

                var SearchParameter = _this.db.escape(TID) + ',' + _this.db.escape(Token) + ',' + _this.db.escape(WorkingDate)
                    + ',' + _this.db.escape(SearchType)+ ',' + _this.db.escape(0) + ',' + _this.db.escape(IPAddress);
                // console.log('Search Information: ' +SearchParameter);
                //     console.log('CALL pSearchInformation(' + SearchParameter + ')');
                _this.db.query('CALL pSearchInformation(' + SearchParameter + ')', function (err, UserInfoResult) {
                    // _this.db.query(searchQuery, function (err, SearchResult) {
                    if (!err) {
                        // console.log(UserInfoResult);
                        if (UserInfoResult[0].length > 0) {
                            res.send(UserInfoResult[0]);
                            console.log('FnSearchEzeid: tmaster: Search result sent successfully');
                        }
                        else {
                            var searchParams = _this.db.escape(TID) + ',' + _this.db.escape(Token) + ',' + _this.db.escape(WorkingDate)
                                + ',' + _this.db.escape(SearchType)+ ',' + _this.db.escape(1) + ',' + _this.db.escape(IPAddress);
                            _this.db.query('CALL pSearchInformation('+ searchParams +')', function (err, UserInfoReResult) {
                                if(!err){
                                    if(UserInfoReResult[0].length > 0){
                                        res.send(UserInfoReResult[0]);
                                        console.log('FnSearchEzeid: tmaster: Search result re sent successfully');
                                    }
                                    else
                                    {
                                        res.json(null);
                                        console.log('FnSearchEzeid: tmaster: no re search infromation ');
                                    }

                                }
                                else {
                                    res.statusCode = 500;
                                    res.json(null);
                                    console.log('FnSearchEzeid: tmaster: ' + err);
                                }
                            });
                        }
                    }
                    else {
                        res.statusCode = 500;
                        res.json(null);
                        console.log('FnSearchEzeid: tmaster: ' + err);
                    }
                });

            }
            else
            {
                FnValidateToken(Token, function (err, Result) {
                    if (!err) {
                        if (Result != null) {
                            var SearchParameter = _this.db.escape(TID) + ',' + _this.db.escape(Token) + ',' + _this.db.escape(WorkingDate)+ ',' + _this.db.escape(SearchType)+',' + _this.db.escape(0) + ',' + _this.db.escape(IPAddress);
                            // console.log('Search Information: ' +SearchParameter);
                            // console.log('CALL pSearchInformation(' + SearchParameter + ')');
                            _this.db.query('CALL pSearchInformation(' + SearchParameter + ')', function (err, UserInfoResult) {
                                // _this.db.query(searchQuery, function (err, SearchResult) {
                                if (!err) {
                                    // console.log(UserInfoResult);
                                    if (UserInfoResult[0].length > 0) {
                                        res.send(UserInfoResult[0]);
                                        console.log('FnSearchEzeid: tmaster: Search result sent successfully');
                                    }
                                    else {
                                        var searchParams = _this.db.escape(TID) + ',' + _this.db.escape(Token) + ',' + _this.db.escape(WorkingDate)
                                            + ',' + _this.db.escape(SearchType)+ ',' + _this.db.escape(1) + ',' + _this.db.escape(IPAddress);
                                        _this.db.query('CALL pSearchInformation('+ searchParams +')', function (err, UserInfoReResult) {
                                            if(!err){
                                                if(UserInfoReResult[0].length > 0){
                                                    res.send(UserInfoReResult[0]);
                                                    console.log('FnSearchEzeid: tmaster: Search result re sent successfully');
                                                }
                                                else
                                                {
                                                    res.json(null);
                                                    console.log('FnSearchEzeid: tmaster: no re search infromation ');
                                                }
                                            }
                                            else {
                                                res.statusCode = 500;
                                                res.json(null);
                                                console.log('FnSearchEzeid: tmaster: ' + err);
                                            }
                                        });
                                    }
                                }
                                else {
                                    res.statusCode = 500;
                                    res.json(null);
                                    console.log('FnSearchEzeid: tmaster: ' + err);
                                }
                            });

                        }
                        else {
                            console.log('FnGetSearchInformation: Invalid token');
                            res.statusCode = 401;
                            res.json(null);
                        }
                    }
                    else {
                        console.log('FnGetSearchInformation: Token error: ' + err);
                        res.statusCode = 500;
                        res.json(null);

                    }
                });
            }
        }
        else {
            if (Token = null) {
                console.log('FnGetUserDetails: Token is empty');
            }
            else if (TID == 'NaN') {
                console.log('FnGetUserDetails: TID is empty');
            }
            else if (CurrentDate == null) {
                console.log('FnGetUserDetails: CurrentDate is empty');
            }

            res.statusCode = 400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetUserDetails error:' + ex.description);
        throw new Error(ex);
    }


};

module.exports = Search;