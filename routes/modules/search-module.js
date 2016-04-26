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

function Search(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
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

    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var type = parseInt(req.body.SearchType);

        if (type == 1){
            type = 2;
        }
        var find = req.body.Keywords;
        var token = req.body.Token ? req.body.Token : 2;
        //var CategoryID = req.body.SCategory;
        //var Proximity = parseInt(req.body.Proximity);
        var Latitude = parseFloat(req.body.Latitude);
        var Longitude = parseFloat(req.body.Longitude);
        var ParkingStatus = (req.body.ParkingStatus) ? req.body.ParkingStatus : '';
        var OpenCloseStatus = (req.body.OpenCloseStatus) ? req.body.OpenCloseStatus : '';
        var Rating = (req.body.Rating) ? req.body.Rating : '';
        var HomeDelivery = (req.body.HomeDelivery) ? req.body.HomeDelivery : 0;
        var CurrentDate = req.body.CurrentDate;
        var count = 0;

        if(CurrentDate)
            CurrentDate = new Date(CurrentDate);
        if(type.toString() == 'NaN')
            type = 0;

        var isPagination = (req.body.isPagination) ? parseInt(req.body.isPagination) : 0 ;
        var pagesize = (req.body.pagesize) ? parseInt(req.body.pagesize) : 0;
        var pagecount = (req.body.pagecount) ? parseInt(req.body.pagecount) : 0;
        var total = (req.body.total) ? parseInt(req.body.total) : 0;
        var promotionFlag = (req.body.promotion_flag) ? ((parseInt(req.body.promotion_flag) == 1) ? req.body.promotion_flag : 2) : 2;


        if (type == "1") {

            if (find && token != null && CurrentDate != null && pagesize != null && pagecount != null) {
                st.validateToken(token, function (err, Result) {
                    if (!err) {
                        if (Result) {
                            if (CurrentDate != null)
                                CurrentDate = new Date(CurrentDate);
                            var LocSeqNo = 0;
                            var EZEID, Pin = null;
                            var DocType = '';
                            var FindArray = find.split('.');
                            var SearchType = 0;

                            //console.log('findarray: ' + FindArray.length);
                            console.log(req.ip);

                            var logHistory = {
                                searchTid: 0,  // who is searching
                                ezeid: FindArray[0],
                                ip: req.ip,
                                type: 0
                            };

                            if (FindArray.length > 0) {
                                EZEID = alterEzeoneId(FindArray[0]);
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
                            var SearchQuery = st.db.escape('') + ',' + st.db.escape(Latitude)
                                + ',' + st.db.escape(Longitude) + ',' + st.db.escape(EZEID) + ',' + st.db.escape(LocSeqNo) + ',' + st.db.escape(Pin) + ',' + st.db.escape(SearchType) + ',' + st.db.escape(DocType)
                                + ',' + st.db.escape("0") + ',' + st.db.escape("0") + ',' + st.db.escape("0") + ',' + st.db.escape(token)
                                + ',' + st.db.escape(HomeDelivery) + ',' + st.db.escape(CurrentDate) + ',' + st.db.escape(isPagination) + ',' +
                                st.db.escape(pagesize) + ',' + st.db.escape(pagecount) + ',' + st.db.escape(total) + ',' + st.db.escape(promotionFlag);

                            console.log('CALL pSearchResultNew(' + SearchQuery + ')');
                            st.db.query('CALL pSearchResultNew(' + SearchQuery + ')', function (err, SearchResult) {
                                // st.db.query(searchQuery, function (err, SearchResult) {
                                //console.log(SearchResult[0]);
                                //console.log(SearchResult[1]);
                                if (!err) {
                                    if (SearchResult[0]) {
                                        if (SearchResult[0].length > 0) {
                                            if (SearchResult[0][0].totalcount == 1) {
                                                if(SearchResult[1]) {
                                                    if (SearchResult[1].length > 0) {
                                                        console.log('coming..1');
                                                        res.json({
                                                            totalcount: SearchResult[0][0].totalcount,
                                                            Result: SearchResult[1]
                                                        });
                                                        console.log('FnSearchByKeywords: tmaster: Search result sent successfully');
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
                                                console.log('coming..2');
                                                //console.log(SearchResult[0]);
                                                res.send(SearchResult[0]);
                                                //res.json({
                                                //    totalcount: 1,
                                                //    Result: SearchResult[0]
                                                //});
                                                console.log('FnSearchByKeywords: tmaster: Search result sent successfully');
                                            }


                                            if (SearchType == 2) {
                                                var getQuery = 'select masterid from tloginout where token=' + st.db.escape(token);
                                                st.db.query(getQuery, function (err, getResult) {
                                                    var tid = 0;
                                                    if (!err) {
                                                        if (getResult) {
                                                            if (getResult[0]) {
                                                                tid = getResult[0].TID;
                                                                console.log(tid);


                                                                var query = st.db.escape(tid) + ',' + st.db.escape(logHistory.ezeid) + ',' + st.db.escape(logHistory.ip) + ',' + st.db.escape(logHistory.type);
                                                                console.log('CALL pCreateAccessHistory(' + query + ')');
                                                                if (logHistory.type > 1) {
                                                                    st.db.query('CALL pCreateAccessHistory(' + query + ')', function (err) {
                                                                        if (!err) {
                                                                            console.log('FnSearchByKeywords:Access history is created');
                                                                        }
                                                                        else {
                                                                            console.log('FnSearchByKeywords: tmaster: ' + err);
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                            else {
                                                                console.log('FnSearchByKeywords:Invalid tid');
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnSearchByKeywords:Result not found');
                                                        }
                                                    }
                                                    else {
                                                        console.log('Error: Result not found');
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
                                    res.json(null);
                                    console.log('FnSearchByKeywords: tmaster: no search found');
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
                if (!find) {
                    console.log('FnSearchByKeywords: keyword is empty');
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

            if (find && !isNaN(Latitude)&& !isNaN(Longitude) && CurrentDate && pagesize != null && pagecount != null) {

                if (ParkingStatus == 0) {
                    ParkingStatus = "0";
                }

                var InsertQuery = st.db.escape(find) + ',' + st.db.escape(Latitude)
                    + ',' + st.db.escape(Longitude) + ',' + st.db.escape('') + ',' + st.db.escape(0) + ',' + st.db.escape(0) + ',' + st.db.escape(1)
                    + ',' + st.db.escape('') + ',' + st.db.escape(ParkingStatus) + ',' + st.db.escape(OpenCloseStatus) + ',' + st.db.escape(Rating)
                    + ',' + st.db.escape(token) + ',' + st.db.escape(HomeDelivery)+ ',' + st.db.escape(CurrentDate) + ',' + st.db.escape(isPagination) + ',' +
                    st.db.escape(pagesize) + ',' + st.db.escape(pagecount)+ ',' + st.db.escape(total) + ','+ st.db.escape(promotionFlag);
                console.log('CALL pSearchResultNew(' + InsertQuery + ')');
                //var link = 'CALL pSearchResult(' + InsertQuery + ')';
                st.db.query('CALL pSearchResultNew(' + InsertQuery + ')', function (err, SearchResult) {
                    if (!err) {
                        //console.log('----------------------------------');
                        //console.log(SearchResult[1]);
                        //console.log(SearchResult[2]);

                        if (SearchResult[0]) {
                            if (SearchResult[0].length > 0) {
                                if (!(SearchResult[0][0].isLoggedIn)) {

                                    if (SearchResult[1]) {
                                        for (var i = 0; i < SearchResult[1].length; i++) {


                                            if (SearchResult[1][i].tilebanner == '') {

                                                if (SearchResult[2].length != count) {

                                                    SearchResult[1][i].tilebanner = req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + SearchResult[2][count].tilebanner;
                                                    SearchResult[1][i].tbURL = SearchResult[2][count].tbURL;
                                                    //SearchResult[1][i].s_url = req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + SearchResult[1][i].tilebanner;

                                                    count += 1;
                                                }
                                            }
                                            else{
                                                SearchResult[1][i].tilebanner=req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + SearchResult[1][i].tilebanner;

                                            }
                                        }
                                    }

                                    res.json({
                                        totalcount: SearchResult[0][0].totalcount,
                                        Result: SearchResult[1],
                                        isLoggedOut: 0
                                    });
                                    console.log('FnSearchByKeywords:  tmaster:Search Found');
                                }
                                else {
                                    res.json({totalcount: 0, Result: [], isLoggedOut: 1, error: 'No search found'});
                                    console.log('FnSearchByKeywords: tmaster: no search found');
                                }
                            }
                            else {
                                res.json({totalcount: 0, Result: [], isLoggedOut: 0, error: 'No search found'});
                                console.log('FnSearchByKeywords:  tmaster: no search found');
                            }
                        }
                        else {
                            res.json({totalcount : 0, Result : [], isLoggedOut: 0,error : 'No search found'});
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
                if (!find) {
                    console.log('FnSearchByKeywords: keyword is empty');
                }
                else if (isNaN(Latitude)) {
                    console.log('FnSearchByKeywords: Latitude is empty');
                }
                else if (isNaN(Longitude)) {
                    console.log('FnSearchByKeywords: Longitude is empty');
                }
                else if (CurrentDate) {
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
        else if (type == "3") {

            if (find && !isNaN(Latitude)&& !isNaN(Longitude) && CurrentDate) {
                if (ParkingStatus == 0) {
                    ParkingStatus = "0";
                }
                var InsertQuery = st.db.escape(find) + ',' + st.db.escape(Latitude)
                    + ',' + st.db.escape(Longitude) + ',' + st.db.escape('') + ',' + st.db.escape(0) + ',' + st.db.escape(0) + ',' + st.db.escape(3)
                    + ',' + st.db.escape('') + ',' + st.db.escape(ParkingStatus) + ',' + st.db.escape(OpenCloseStatus) + ',' + st.db.escape(Rating)
                    + ',' + st.db.escape(token)  + ',' + st.db.escape(HomeDelivery)+ ',' + st.db.escape(CurrentDate) + ',' + st.db.escape(isPagination) + ',' +
                    st.db.escape(pagesize) + ',' + st.db.escape(pagecount)+ ',' + st.db.escape(total) + ',' + st.db.escape(promotionFlag);
                console.log('CALL pSearchResultNew(' + InsertQuery + ')');
                st.db.query('CALL pSearchResultNew(' + InsertQuery + ')', function (err, SearchResult) {
                    if (!err) {
                        if(SearchResult) {
                            if (SearchResult[0]) {
                                if (SearchResult[0].length > 0) {
                                    if (SearchResult[1]) {
                                        //res.send(SearchResult[0]);
                                        res.json({totalcount: SearchResult[0][0].totalcount, Result: SearchResult[1]});
                                        console.log('FnSearchByKeywords:  tmaster:Search Found');
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
                                res.json(null);
                                console.log('FnSearchByKeywords:  tmaster: no search found');
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
                if (!find) {
                    console.log('FnSearchByKeywords: keyword is empty');
                }
                else if (CurrentDate) {
                    console.log('FnSearchByKeywords: CurrentDate is empty');
                }
                else if (isNaN(Latitude)) {
                    console.log('FnSearchByKeywords: Latitude is empty');
                }
                else if (isNaN(Longitude)) {
                    console.log('FnSearchByKeywords: Longitude is empty');
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
        var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
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
     * @todo FnGetSearchInformationNew
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = (req.query.Token) ? req.query.Token : '';
        var ezeTerm = alterEzeoneId(req.query.ezeTerm);
        var CurrentDate = req.query.CurrentDate;
        var IPAddress = req._remoteAddress; //(req.headers['x-forwarded-for'] || req.connection.remoteAddress)
        var latitude = (req.query.lat) ? req.query.lat : 0;
        var longitude = (req.query.lng) ? req.query.lng : 0;
        var output = [];

        var WorkingDate;
        var moment = require('moment');
        if(CurrentDate)
            WorkingDate =  moment(new Date(CurrentDate)).format('YYYY-MM-DD HH:MM');
        else
            WorkingDate = moment(new Date()).format('YYYY-MM-DD HH:MM');


        if (ezeTerm) {
            var LocSeqNo = 0;
            var EZEID, Pin = null;
            var FindArray = ezeTerm.split('.');

            if (FindArray.length > 0) {
                EZEID = FindArray[0];
                //checking the fisrt condition
                if (FindArray.length > 1) {
                    if (FindArray[1] != '') {
                        //if (FindArray[1].charAt(0).toUpperCase() == 'L') {
                        //    LocSeqNo = FindArray[1].toString().substring(1, FindArray[1].length);
                        //}

                        //else {
                            Pin = FindArray[1];
                        //}
                        //checking the second condition
                        //if (typeof FindArray[2] != 'undefined') {
                        //    Pin = FindArray[2];
                        //}
                        //checking the final condition
                    }
                }
            }
            var SearchParameter = st.db.escape(Token) + ',' + st.db.escape(WorkingDate) + ',' + st.db.escape(IPAddress)
                + ',' + st.db.escape(EZEID) + ',' + st.db.escape(Pin)+ ',' + st.db.escape(latitude) + ',' + st.db.escape(longitude);
            console.log('CALL pSearchInformationNew(' + SearchParameter + ')');
            st.db.query('CALL pSearchInformationNew(' + SearchParameter + ')', function (err, UserInfoResult) {
                // st.db.query(searchQuery, function (err, SearchResult) {
                if (!err) {
                    if(UserInfoResult) {
                        if (UserInfoResult[0]) {
                            if (UserInfoResult[0].length > 0) {

                                UserInfoResult[0][0].dealbanner = (UserInfoResult[0][0].dealbanner) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + UserInfoResult[0][0].dealbanner) : '';
                                //console.log(UserInfoResult[1]);
                                if(UserInfoResult[1]) {
                                    if (UserInfoResult[1].length) {

                                        if (UserInfoResult[1][0].type == 0) {

                                            for (var i = 0; i < UserInfoResult[1].length; i++) {

                                                console.log('for loop..type..0');
                                                var result = {};

                                                result.s_url1 = (UserInfoResult[1][0].pic) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + UserInfoResult[1][0].pic) : '';
                                                result.s_url2 = (UserInfoResult[1][0].InfoBannerFile1) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + UserInfoResult[1][0].InfoBannerFile1) : '';
                                                result.s_url3 = (UserInfoResult[1][0].InfoBannerFile2) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + UserInfoResult[1][0].InfoBannerFile2) : '';
                                                result.s_url4 = (UserInfoResult[1][0].InfoBannerFile3) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + UserInfoResult[1][0].InfoBannerFile3) : '';
                                                result.s_url5 = (UserInfoResult[1][0].InfoBannerFile4) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + UserInfoResult[1][0].InfoBannerFile4) : '';
                                                result.s_url6 = (UserInfoResult[1][0].InfoBannerFile5) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + UserInfoResult[1][0].InfoBannerFile5) : '';
                                                output.push(result);
                                            }

                                            var finalResult = {
                                                "banners": [
                                                    {"s_url": output[0].s_url1},
                                                    {"s_url": output[0].s_url2},
                                                    {"s_url": output[0].s_url3},
                                                    {"s_url": output[0].s_url4},
                                                    {"s_url": output[0].s_url5},
                                                    {"s_url": output[0].s_url6}]
                                            };
                                            output = finalResult.banners;

                                        }
                                        else {
                                            console.log('for loop..type..2');
                                            for (var i = 0; i < UserInfoResult[1].length; i++) {
                                                var result = {};

                                                result.s_url = req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + UserInfoResult[1][i].path;
                                                output.push(result);
                                            }
                                        }
                                        res.json({result: UserInfoResult[0][0], banners: output});
                                        console.log('FnGetSearchInformationNew: tmaster: Search result sent successfully');
                                    }
                                    else {
                                        res.json({result: UserInfoResult[0][0], banners: output});
                                        console.log('FnGetSearchInformationNew: tmaster: Search result sent successfully');
                                    }
                                }
                                else {
                                    res.json({result: UserInfoResult[0][0], banners: output});
                                    console.log('FnGetSearchInformationNew: tmaster: Search result sent successfully');
                                }
                            }
                            else {
                                res.send('null');
                                console.log('FnGetSearchInformationNew: tmaster: no re search infromation1 ');
                            }
                        }
                        else {
                            res.send('null');
                            console.log('FnGetSearchInformationNew: tmaster: no re search infromation2 ');
                        }
                    }
                    else {
                        res.send('null');
                        console.log('FnGetSearchInformationNew: tmaster: no re search infromation3 ');
                    }
                }
                else {
                    res.statusCode = 500;
                    res.send('null');
                    console.log('FnGetSearchInformationNew: tmaster: ' + err);
                }
            });
        }

        else {
            if (ezeTerm = null) {
                console.log('FnGetSearchInformationNew: ezeTerm is empty');
            }
            res.statusCode = 400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetUserDetails error:' + ex.description);
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
Search.prototype.getWorkingHrsHolidayList = function (req, res) {
    /**
     * @todo FnGetWorkingHrsHolidayList
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var LocID = req.query.LocID;
        var RtnMessage = {
            WorkingHours: '',
            HolidayList:'',
            Result: false
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if(LocID == null)
            LocID = 0;
        if (Token && LocID != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        var async = require('async');
                        async.parallel([ function FnWorkingHours(CallBack) {
                            try {

                                var query = st.db.escape(Token) + ',' + st.db.escape(LocID);
                                st.db.query('CALL pGetWorkingHours(' + query + ')', function (err, WorkingResult) {
                                    console.log('CALL pGetWorkingHours(' + query + ')');

                                    if (!err) {

                                        if(WorkingResult)  {
                                            if(WorkingResult[0]) {
                                                if (WorkingResult[0].length > 0) {
                                                    console.log('FnWorkingHours: Working Hours are available');
                                                    RtnMessage.WorkingHours = WorkingResult[0];
                                                    RtnMessage.Result = true;
                                                    CallBack();
                                                }
                                                else {
                                                    console.log('Fnworkinghours: no working hours avaiable');
                                                    RtnMessage.Result = true;
                                                    CallBack();
                                                }
                                            }
                                            else{
                                                console.log('Fnworkinghours: no working hours avaiable');
                                                RtnMessage.Result = true;
                                                CallBack();
                                            }
                                        }
                                        else{
                                            console.log('Fnworkinghours: no working hours avaiable');
                                            RtnMessage.Result = true;
                                            CallBack();
                                        }
                                    }
                                    else {
                                        console.log('FnWorkingHours: sending workinghours error ' + error);
                                        CallBack();
                                    }
                                });
                            }
                            catch (ex) {
                                console.log('FnWorkingHours error:' + ex.description);
                                //throw new Error(ex);
                                return 'error'
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');
                            }
                        } ,function FnHolidayList(CallBack) {
                            try {
                                var query = st.db.escape(LocID) + ',' + st.db.escape(0);
                                st.db.query('CALL pGetHolidayList(' + query + ')', function (err, HolidayResult) {
                                    console.log('CALL pGetHolidayList(' + query + ')');

                                    if (!err) {
                                        if(HolidayResult != null)
                                        {
                                            if(HolidayResult[0].length > 0 )
                                            {
                                                console.log('FnHolidayList: Holiday List are available');
                                                RtnMessage.HolidayList = HolidayResult[0]
                                                RtnMessage.Result = true;
                                                CallBack();
                                            }
                                            else
                                            {
                                                console.log('FnHolidayList: No Holiday List avaiable');
                                                RtnMessage.Result = true;
                                                CallBack();
                                            }
                                        }
                                        else{
                                            console.log('FnHolidayList: No Holiday List avaiable');
                                            RtnMessage.Result = true;
                                            CallBack();
                                        }
                                    }
                                    else {
                                        console.log('FnHolidayList: sending holiday list error ');
                                        CallBack();
                                    }
                                });
                            }
                            catch (ex) {
                                console.log('FnHolidayList error:' + ex.description);
                                //throw new Error(ex);
                                return 'error'
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');
                            }
                        }
                        ],function(err){
                            if(!err){
                                console.log('GnGetWorkingHrs : data sent successfully');
                                res.send(RtnMessage);
                            }
                            else
                            {
                                res.statusCode = 500;
                                res.send(RtnMessage);
                                console.log('error in parellel async callling' + err);
                            }

                        });

                    }
                    else {
                        res.statusCode = 401;
                        res.send(RtnMessage);
                        console.log('FnGetWorkingHours: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.send(RtnMessage);
                    console.log('FnGetWorkingHours: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetWorkingHours: Token is empty');
            }
            else if (LocID == null) {
                console.log('FnGetWorkingHours: LocID is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnGetWorkingHours error:' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

function FnWorkingHours(WorkingContent, CallBack) {
    try {

        if (WorkingContent) {

            //console.log('WorkingContent values');
           // console.log(WorkingContent);

            var query = st.db.escape(WorkingContent.Token) + ',' + st.db.escape(WorkingContent.LocID);
            st.db.query('CALL pGetWorkingHours(' + query + ')', function (err, WorkingResult) {
                console.log('CALL pGetWorkingHours(' + query + ')');

                if (!err) {

                    if(WorkingResult) {
                        if(WorkingResult[0]) {
                            if (WorkingResult[0].length > 0) {
                                console.log('FnWorkingHours: Working Hours are available');
                                CallBack(null, WorkingResult[0]);
                            }
                            else {
                                console.log('Fnworkinghours: no working hours avaiable');
                                CallBack(null, null);
                            }
                        }
                        else{
                            console.log('Fnworkinghours: no working hours avaiable');
                            CallBack(null,null);
                        }
                    }
                    else{
                        console.log('Fnworkinghours: no working hours avaiable');
                        CallBack(null,null);
                    }
                }
                else {
                    console.log('FnWorkingHours: sending workinghours error ' + error);
                    CallBack(null, null);
                }
            });
        }
        else {
            CallBack(null, null);
            console.log('FnWorkingHours: Working content is empty');
        }

    }
    catch (ex) {
        console.log('FnWorkingHours error:' + ex.description);
        //throw new Error(ex);
        return 'error'
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

function FnHolidayList(HolidayContent, CallBack) {
    try {

        if (HolidayContent) {

            //console.log('HolidayContent values');
            //console.log(HolidayContent);

            var query = st.db.escape(HolidayContent.LocID) + ',' + st.db.escape(0);
            st.db.query('CALL pGetHolidayList(' + query + ')', function (err, HolidayResult) {
                console.log('CALL pGetHolidayList(' + query + ')');

                if (!err) {
                    if(HolidayResult){
                        if(HolidayResult[0]) {
                            if (HolidayResult[0].length > 0) {
                                console.log('FnHolidayList: Holiday List are available');
                                CallBack(null, HolidayResult[0]);
                            }
                            else {
                                console.log('FnHolidayList: No Holiday List avaiable');
                                CallBack(null, null);
                            }
                        }
                        else{
                            console.log('FnHolidayList: No Holiday List avaiable');
                            CallBack(null,null);
                        }
                    }
                    else{
                        console.log('FnHolidayList: No Holiday List avaiable');
                        CallBack(null,null);
                    }
                }
                else {
                    console.log('FnHolidayList: sending holiday list error ' + error);
                    CallBack(null, null);
                }
            });
        }
        else {
            CallBack(null, null);
            console.log('FnHolidayList: holiday list content is empty');
        }

    }
    catch (ex) {
        console.log('FnHolidayList error:' + ex.description);
        //throw new Error(ex);
        return 'error'
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
Search.prototype.getBanner = function(req,res,next){
    /**
     * @todo FnGetBannerPicture
     */

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var SeqNo = parseInt(req.query.SeqNo);
        var StateTitle = req.query.StateTitle;
        var Ezeid = alterEzeoneId(req.query.Ezeid);
        var LocID = req.query.LocID;
        // var TokenNo = req.query.Token;

        var RtnMessage = {
            Picture: ''
        };
        RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        Ezeid = Ezeid.split(',').pop();
        if ( !isNaN(SeqNo)&& Ezeid != null && LocID != null) {
            var Query = st.db.escape(Ezeid) + ',' + st.db.escape(SeqNo) + ',' + st.db.escape(0);
            console.log(Query);
            st.db.query('CALL PGetBannerPicsUsers(' + Query + ')', function (err, BannerResult) {
                if (!err) {
                    //console.log(BannerResult);
                    if (BannerResult ) {
                        if(BannerResult[0]) {
                            if (BannerResult[0].length > 0) {
                                var Picture = BannerResult[0];
                                console.log('FnGetBannerPicture: Banner picture sent successfully');
                                res.setHeader('Cache-Control', 'public, max-age=150000');
                                console.log('FnGetBannerPicture: Banner picture sent successfully');
                                RtnMessage.Picture = Picture[0].Picture;
                                res.send(RtnMessage);
                            }
                            else {
                                var fs = require('fs');
                                //  var path = path + StateTitle+'.jpg' ;
                                fs.exists(path + StateTitle + '.jpg', function (exists) {
                                   // console.log(exists)
                                    if (exists) {
                                        var bitmap = fs.readFileSync(path + StateTitle + '.jpg');
                                        // convert binary data to base64 encoded string
                                        RtnMessage.Picture = new Buffer(bitmap).toString('base64');
                                        res.send(RtnMessage);
                                        console.log('FnGetBannerPicture: State Banner sent successfully');
                                    }
                                    else {
                                        // path ='D:\\Mail\\Default.jpg';
                                        fs.exists(path + StateTitle + '.jpg', function (exists) {
                                            //console.log(exists)
                                            if (exists) {

                                                var bitmap = fs.readFileSync(path + 'Default.jpg');
                                                // convert binary data to base64 encoded string
                                                RtnMessage.Picture = new Buffer(bitmap).toString('base64');
                                                res.send(RtnMessage);
                                                console.log('FnGetBannerPicture: Default Banner sent successfully');
                                            }
                                            else {
                                                res.json(null);
                                                console.log('FnGetBannerPicture: Default Banner not available');
                                            }
                                        });
                                    }
                                });
                            }
                        }
                        else {
                            res.json(null);
                            console.log('FnGetBannerPicture:tmaster: Registration Failed');
                        }
                    }
                    else {
                        res.json(null);
                        console.log('FnGetBannerPicture:tmaster: Registration Failed');
                    }
                }
                else {
                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetBannerPicture:tmaster:' + err);
                }
            });
        }
        else {
            if (isNaN(SeqNo)) {
                console.log('FnGetBannerPicture: SeqNo is empty');
            }
            else if(Ezeid == null) {
                console.log('FnGetBannerPicture: Ezeid is empty');
            }
            else if(LocID == null) {
                console.log('FnGetBannerPicture: LocID is empty');
            }
            res.statusCode=400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnGetBannerPicture error:' + ex.description);
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
Search.prototype.searchTracker = function(req,res,next){
    /**
     * @todo FnSearchForTracker
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.body.Token;
        var Keyword = req.body.Keyword;
        var Latitude = req.body.Latitude;
        var Longitude = req.body.Longitude;
        var Proximity = (req.body.Proximity) ? req.body.Proximity : 1;
        var currentDateTime = (req.body.CurrentDate) ? req.body.CurrentDate : '';
        //var currentDateTime = req.body.CurrentDate;
        var trackerFlag = ((!isNaN(parseInt(req.body.Flag)))&& parseInt(req.body.Flag) > 0) ? parseInt(req.body.Flag) : 0;


        if (Token && Keyword != null && Latitude != null && Longitude != null && currentDateTime) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        var query = st.db.escape(Keyword) + ','  + st.db.escape(Latitude) + ',' +
                            st.db.escape(Longitude) + ',' + st.db.escape(Proximity)+
                            ',' + st.db.escape(Token) + ',' +st.db.escape(currentDateTime) + ',' +st.db.escape(trackerFlag);
                        console.log('CALL pTrackerSearch(' + query + ')');
                        st.db.query('CALL pTrackerSearch(' + query + ')', function (err, GetResult) {
                           // console.log(GetResult);
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0]) {
                                        if (GetResult[0].length > 0) {
                                            console.log('FnSearchForTracker: Search result sent successfully');
                                            var responseMessage = {
                                                totalcount : GetResult[0].length,
                                                result: GetResult[0]
                                            };
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            console.log('FnSearchForTracker:No Search found');
                                            res.json(null);
                                        }
                                    }
                                    else {
                                        console.log('FnSearchForTracker:No Search found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnSearchForTracker:No Search found');
                                    res.json(null);
                                }
                            }
                            else {

                                console.log('FnSearchForTracker: error in getting search result' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnSearchForTracker: Invalid Token');
                    }
                } else {
                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnSearchForTracker: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!Token) {
                console.log('FnSearchForTracker: Token is empty');
            }
            else if (Keyword == null) {
                console.log('FnSearchForTracker: Keyword is empty');
            }
            else if (Latitude == null) {
                console.log('FnSearchForTracker: Latitude is empty');
            }
            else if (Longitude == null) {
                console.log('FnSearchForTracker: Longitude is empty');
            }
            else if (Proximity == null) {
                console.log('FnSearchForTracker: Proximity is empty');
            }
            else if (!currentDateTime) {
                console.log('FnSearchForTracker: currentDateTime is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnSearchForTracker error:' + ex.description);
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
Search.prototype.getSearchDoc = function(req,res,next){
    /**
     * @todo FnGetSearchDocuments
     */

    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var find = alterEzeoneId(req.query.Keywords);
        var token = req.query.Token;
        var tid;
        //console.log(token);
        if (token && find) {
            st.validateToken(token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        var EZEID, Pin = null;
                        var DocType = '';
                        var FindArray = find.split('.');
                        var type ='';

                        //console.log('findarray: ' + FindArray.length);
                        if (FindArray.length > 0) {
                            EZEID = FindArray[0];
                            //checking the fisrt condition
                            if (FindArray.length > 1) {
                                if (FindArray[1] != '') {
                                    if (FindArray[1].toUpperCase() == 'ID') {
                                        //console.log('ID');
                                        DocType = 'ID';
                                        type = 3;
                                    }
                                    else if (FindArray[1].toUpperCase() == 'DL') {
                                        //console.log('DL');
                                        DocType = 'DL';
                                        type = 7;
                                    }
                                    else if (FindArray[1].toUpperCase() == 'PP') {
                                        //console.log('PP');
                                        DocType = 'PP';
                                        type = 4;
                                    }
                                    else if (FindArray[1].toUpperCase() == 'BR') {
                                        //console.log('BR');
                                        DocType = 'BR';
                                        type = 1;
                                    }
                                    else if (FindArray[1].toUpperCase() == 'CV') {
                                        //console.log('CV');
                                        DocType = 'CV';
                                        type = 2;
                                    }
                                    else if (FindArray[1].toUpperCase() == 'D1') {
                                        //console.log('D1');
                                        DocType = 'D1';
                                        type = 5;
                                    }
                                    else if (FindArray[1].toUpperCase() == 'D2') {
                                        //console.log('D2');
                                        DocType = 'D2';
                                        type = 6;
                                    }
                                    else {
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
                        var SearchQuery = st.db.escape(EZEID) + ',' + st.db.escape(Pin) + ',' + st.db.escape(DocType);
                        console.log('CALL  PGetSearchDocuments(' + SearchQuery + ')');
                        st.db.query('CALL  PGetSearchDocuments(' + SearchQuery + ')', function (err, SearchResult) {
                            // st.db.query(searchQuery, function (err, SearchResult) {
                            if (!err) {
                                if(SearchResult) {
                                    if (SearchResult[0]) {
                                        if (SearchResult[0].length > 0) {
                                            SearchResult = SearchResult[0];
                                            //console.log(DocumentResult)
                                            var docs = SearchResult[0];
                                            res.setHeader('Content-Type', docs.ContentType);
                                            res.setHeader('Content-Disposition', 'attachment; filename=' + docs.Filename);
                                            //res.setHeader('Cache-Control', 'public, max-age=86400000');
                                            res.setHeader('Cache-Control', 'public, max-age=0');
                                            res.writeHead('200', {'Content-Type': docs.ContentType});
                                            res.end(docs.Docs, 'base64');
                                            console.log('FnGetSearchDocuments: tmaster: Search result sent successfully');


                                            var getQuery = 'select masterid as TID from tloginout where Token=' + st.db.escape(token);
                                            st.db.query(getQuery, function (err, getResult) {
                                                if (!err) {
                                                    tid = getResult[0].TID;
                                                    console.log(tid);
                                                }
                                                var query = st.db.escape(tid) + ',' + st.db.escape(EZEID) + ',' + st.db.escape(req.ip) + ',' + st.db.escape(type);
                                                console.log('CALL pCreateAccessHistory(' + query + ')');

                                                st.db.query('CALL pCreateAccessHistory(' + query + ')', function (err) {
                                                    if (!err) {
                                                        console.log('FnSearchByKeywords:Access history is created');
                                                    }
                                                    else {
                                                        console.log('FnSearchByKeywords: tmaster: ' + err);
                                                    }
                                                });
                                            });
                                        }
                                        else {
                                            res.json(null);
                                            console.log('FnGetSearchDocuments: tmaster: no search found');
                                        }
                                    }
                                    else {
                                        res.json(null);
                                        console.log('FnGetSearchDocuments: tmaster: no search found');
                                    }
                                }
                                else {
                                    res.json(null);
                                    console.log('FnGetSearchDocuments: tmaster: no search found');
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.json(null);
                                console.log('FnGetSearchDocuments: tmaster: ' + err);
                            }
                        });


                    }
                    else {
                        console.log('FnGetSearchDocuments: Invalid token');
                        res.statusCode = 401;
                        res.json(null);
                    }
                }
                else {
                    console.log('FnGetSearchDocuments: ' + err);
                    res.statusCode = 500;
                    res.json(null);
                }
            });
        }
        else {
            if (!token) {
                console.log('FnGetSearchDocuments: token is empty');
            }
            else if (!find) {
                console.log('FnGetSearchDocuments: find is empty');
            }
            res.statusCode = 400;
            res.json(null);

        }
    }
    catch (ex) {
        console.log('FnGetSearchDocuments error:' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next

 * Finds the user login status using a cookie login
 * which is created by angular at the time of signin or signup
 * @param req
 * @param res
 * @param next
 * @constructor
 */
Search.prototype.searchBusListing = function(req,res,next){
    /**
     * @todo FnSearchBusListing


     * HTML Pages list from angular routings scheme
     * Any new url pattern addition in angular should be added in this list also
     * @type {string[]}
     */
    var htmlPagesList = [
        'signup',
        'messages',
        'landing',
        'access-history',
        'busslist',
        'terms',
        'help',
        'legal',
        'blackwhitelist',
        'salesenquiry',
        'bulksalesenquiry',
        'viewdirection',
        'service-reservation',
        'business-manager',
        'profile-manager',
        'searchResult',
        'searchDetails',
        'outbox'
    ];

    var loginCookie = (req.cookies['login']) ? ((req.cookies['login'] === 'true') ? true : false ) : false;
    if(!loginCookie){
        /**
         * Checks if ezeid parameter is existing and checks in the list that is it a
         * ezeid angular url using the htmlPageList
         * If not then it will see in the database for
         * business ID
         */
        if(req.params['ezeid'] && htmlPagesList.indexOf(req.params.ezeid) === -1){
            /**
             * Checking the EZEID for it's validity
             */
            var arr = req.params.ezeid.split('.');

            if(arr.length < 2 && arr.length > 0){
                /**
                 * Find if the user type is business or not
                 */
                var ezeidQuery = "SELECT tlocations.PIN AS PIN, tmaster.TID, tlocations.TID AS LID ,"+
                    " tmaster.IDTypeID AS IDTypeID FROM tlocations"+
                    " INNER JOIN tmaster ON " +
                    "tmaster.TID = tlocations.MasterID AND tlocations.SeqNo = 0 AND tmaster.EZEID = "+
                    db.escape(req.params.ezeid)+ " LIMIT 1";
                db.query(ezeidQuery,function(err,results){
                    if(!err){
                        if(results) {
                            if (results.length > 0) {
                                if ((!results[0].PIN) && results[0].IDTypeID !== 1) {
                                    res.redirect('/searchDetails?searchType=2&TID=' + results[0].LID);
                                }
                                else {
                                    next();
                                }
                            }
                            else {
                                next();
                            }
                        }
                        else {
                            next();
                        }
                    }
                    else{
                        next();
                    }
                });
            }
            else{
                next();
            }
        }
        else{
            next();
        }
    }
    else{
        next();
    }
};

/**
 * @todo FnNavigateSearch
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description search jobs of a person
 */
Search.prototype.navigateSearch = function(req,res,next){
    var _this = this;
    try {

        var token = req.query.token;
        var latitude = (req.query.lat) ? req.query.lat : 0;
        var longitude = (req.query.lng) ? req.query.lng : 0;
        var keywords = (req.query.k) ? req.query.k : '';


        var responseMessage = {
            status: false,
            error: {},
            message: '',
            data: []
        };

        st.validateToken(token, function (err, result) {
            if (!err) {
                if (result) {

                    var queryParams = st.db.escape(keywords) + ',' + st.db.escape(latitude) + ',' + st.db.escape(longitude);

                    var query = 'CALL Pnavigatesearch(' + queryParams + ')';
                    console.log(query);

                    st.db.query(query, function (err, getresult) {
                        //console.log(getresult);
                        if (!err) {
                            if (getresult) {
                                if (getresult[0]) {
                                    if (getresult[0][0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Search result loaded successfully';
                                        responseMessage.data = getresult[0][0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnNavigateSearch: Search result loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Search result not found';
                                        res.status(200).json(responseMessage);
                                        console.log('FnNavigateSearch: Search result not found');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Search result not found';
                                    res.status(200).json(responseMessage);
                                    console.log('FnNavigateSearch: Search result not found');
                                }
                            }
                            else {
                                responseMessage.message = 'Search result not found';
                                res.status(200).json(responseMessage);
                                console.log('FnNavigateSearch:Search result not found');
                            }
                        }
                        else {
                            responseMessage.message = 'An error occured ! Please try again';
                            responseMessage.error = {
                                server: 'Internal server error'
                            };
                            res.status(500).json(responseMessage);
                            console.log('FnNavigateSearch: error in getting navigate search:' + err);
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
                    console.log('FnNavigateSearch: Invalid token');
                }
            }
            else {
                responseMessage.error = {
                    server: 'Internal server error'
                };
                responseMessage.message = 'Error in validating Token';
                res.status(500).json(responseMessage);
                console.log('FnNavigateSearch:Error in processing Token' + err);
            }
        });
    }
    catch(ex){
        responseMessage.error = {
            server : 'Internal server error'
        };
        responseMessage.message = 'An error occurred !';
        console.log('FnNavigateSearch:error ' + ex.description);
        console.log(ex);
        var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
        res.status(400).json(responseMessage);
    }
};


module.exports = Search;