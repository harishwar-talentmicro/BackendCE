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
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var type = parseInt(req.body.SearchType);
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

        if(CurrentDate != null)
            CurrentDate = new Date(CurrentDate);
        if(type.toString() == 'NaN')
            type = 0;

        var isPagination = req.body.isPagination ? parseInt(req.body.isPagination) : 0 ;
        var pagesize = req.body.pagesize ? parseInt(req.body.pagesize) : 0;
        var pagecount = req.body.pagecount ? parseInt(req.body.pagecount) : 0;
        var total = req.body.total ? parseInt(req.body.total) : 0;
        var promotionFlag = (req.body.promotion_flag) ? ((parseInt(req.body.promotion_flag) == 1) ? req.body.promotion_flag : 2) : 2;


        if (type == "1") {

            if (find != null && find != '' && token != null && CurrentDate != null && pagesize != null && pagecount != null) {
                st.validateToken(token, function (err, Result) {
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
                                + ',' + st.db.escape(Longitude) +',' + st.db.escape(EZEID) + ',' + st.db.escape(LocSeqNo) + ',' + st.db.escape(Pin) + ',' + st.db.escape(SearchType) + ',' + st.db.escape(DocType)
                                + ',' + st.db.escape("0") + ',' + st.db.escape("0") + ',' + st.db.escape("0") + ',' + st.db.escape(token)
                                + ',' + st.db.escape(HomeDelivery) + ',' + st.db.escape(CurrentDate) + ',' + st.db.escape(isPagination) + ',' +
                                st.db.escape(pagesize) + ',' + st.db.escape(pagecount) + ',' + st.db.escape(total)+ ',' +st.db.escape(promotionFlag) ;

                            console.log('CALL pSearchResultNew(' + SearchQuery + ')');
                            st.db.query('CALL pSearchResultNew(' + SearchQuery + ')', function (err, SearchResult) {
                                // st.db.query(searchQuery, function (err, SearchResult) {
                                if (!err) {
                                    if (SearchResult[0]) {
                                        if (SearchResult[0].length > 0) {
                                            if (SearchResult[0][0].totalcount == 1) {
                                                res.json({
                                                    totalcount: SearchResult[0][0].totalcount,
                                                    Result: SearchResult[1]
                                                });
                                                console.log('FnSearchByKeywords: tmaster: Search result sent successfully');
                                            }
                                            else {
                                                console.log(SearchResult[0]);
                                                res.send(SearchResult[0]);
                                                console.log('FnSearchByKeywords: tmaster: Search result sent successfully');
                                            }

                                            if (SearchType == 2) {

                                                var getQuery = 'select TID from tmaster where Token=' + st.db.token;
                                                st.db.query(getQuery, function (err, getResult) {
                                                    console.log(getResult);
                                                    if (getResult) {
                                                        var tid = getResult[0].TID;

                                                        var getQuery = 'select masterid from tloginout where token=' + st.db.escape(token);
                                                        st.db.query(getQuery, function (err, getResult) {
                                                            var tid = 0;
                                                            if (!err) {
                                                                if (getResult) {
                                                                    if (getResult[0]) {
                                                                        tid = getResult[0].TID;
                                                                    }
                                                                }


                                                                console.log(tid);
                                                            }
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

            if (find != null && find != ''&& Latitude.toString() != 'NaN' && Longitude.toString() != 'NaN' && CurrentDate != null && pagesize != null && pagecount != null) {

                if (ParkingStatus == 0) {
                    ParkingStatus = "1,2,3";
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
                else if (Latitude == 'NaN') {
                    console.log('FnSearchByKeywords: Latitude is empty');
                }
                else if (Longitude == 'NaN') {
                    console.log('FnSearchByKeywords: Longitude is empty');
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

            if (find != null && find != '' && Latitude.toString() != 'NaN' && Longitude.toString() != 'NaN' && CategoryID != null && CurrentDate != null) {
                if (ParkingStatus == 0) {
                    ParkingStatus = "1,2,3";
                }
                var InsertQuery = st.db.escape(find) + ',' + st.db.escape(Latitude)
                    + ',' + st.db.escape(Longitude) + ',' + st.db.escape('') + ',' + st.db.escape(0) + ',' + st.db.escape(0) + ',' + st.db.escape(3)
                    + ',' + st.db.escape('') + ',' + st.db.escape(ParkingStatus) + ',' + st.db.escape(OpenCloseStatus) + ',' + st.db.escape(Rating)
                    + ',' + st.db.escape(token)  + ',' + st.db.escape(HomeDelivery)+ ',' + st.db.escape(CurrentDate) + ',' + st.db.escape(isPagination) + ',' +
                    st.db.escape(pagesize) + ',' + st.db.escape(pagecount)+ ',' + st.db.escape(total) + ',' + st.db.escape(promotionFlag);
                console.log('CALL pSearchResultNew(' + InsertQuery + ')');
                st.db.query('CALL pSearchResultNew(' + InsertQuery + ')', function (err, SearchResult) {
                    if (!err) {
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

                else if (Latitude == 'NaN') {
                    console.log('FnSearchByKeywords: Latitude is empty');
                }
                else if (Longitude == 'NaN') {
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
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token ? req.query.Token : '';
        var ezeTerm = alterEzeoneId(req.query.ezeTerm);
        var CurrentDate = req.query.CurrentDate;
        var IPAddress = req._remoteAddress; //(req.headers['x-forwarded-for'] || req.connection.remoteAddress)
        console.log(IPAddress);
        var WorkingDate
        var moment = require('moment');
        if(CurrentDate != null)
            var WorkingDate =  moment(new Date(CurrentDate)).format('YYYY-MM-DD HH:MM');
        else
            var WorkingDate = moment(new Date()).format('YYYY-MM-DD HH:MM');
        //console.log(WorkingDate);

        if (ezeTerm) {
            var LocSeqNo = 0;
            var EZEID, Pin = null;
            var FindArray = ezeTerm.split('.');

            if (FindArray.length > 0) {
                EZEID = FindArray[0];
                //checking the fisrt condition
                if (FindArray.length > 1) {
                    if (FindArray[1] != '') {
                        if (FindArray[1].charAt(0).toUpperCase() == 'L') {
                            LocSeqNo = FindArray[1].toString().substring(1, FindArray[1].length);
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
            var SearchParameter = st.db.escape(Token) + ',' + st.db.escape(WorkingDate) + ',' + st.db.escape(IPAddress) + ',' + st.db.escape(EZEID) + ',' + st.db.escape(LocSeqNo) + ',' + st.db.escape(Pin);
            console.log('CALL pSearchInformationNew(' + SearchParameter + ')');
            st.db.query('CALL pSearchInformationNew(' + SearchParameter + ')', function (err, UserInfoResult) {
                // st.db.query(searchQuery, function (err, SearchResult) {
                if (!err) {
                    // console.log(UserInfoResult);
                    if (UserInfoResult[0].length > 0) {
                        res.send(UserInfoResult[0]);
                        console.log('FnGetSearchInformationNew: tmaster: Search result sent successfully');
                    }
                    else {
                        res.send('null');
                        console.log('FnGetSearchInformationNew: tmaster: no re search infromation ');
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
    var _this = this;
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
        if (Token != null && LocID != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var async = require('async');
                        async.parallel([ function FnWorkingHours(CallBack) {
                            try {

                                var query = st.db.escape(Token) + ',' + st.db.escape(LocID);
                                st.db.query('CALL pGetWorkingHours(' + query + ')', function (err, WorkingResult) {
                                    console.log('CALL pGetWorkingHours(' + query + ')');

                                    if (!err) {

                                        if(WorkingResult != null)
                                        {
                                            if(WorkingResult[0].length > 0 )
                                            {
                                                console.log('FnWorkingHours: Working Hours are available');
                                                RtnMessage.WorkingHours = WorkingResult[0];
                                                RtnMessage.Result = true;
                                                CallBack();
                                            }
                                            else
                                            {
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
                                        console.log('FnHolidayList: sending holiday list error ' + error);
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

        if (WorkingContent != null) {

            console.log('WorkingContent values');
            console.log(WorkingContent);

            var query = st.db.escape(WorkingContent.Token) + ',' + st.db.escape(WorkingContent.LocID);
            st.db.query('CALL pGetWorkingHours(' + query + ')', function (err, WorkingResult) {
                console.log('CALL pGetWorkingHours(' + query + ')');

                if (!err) {

                    if(WorkingResult != null)
                    {
                        if(WorkingResult[0].length > 0 )
                        {
                            console.log('FnWorkingHours: Working Hours are available');
                            CallBack(null, WorkingResult[0]);
                        }
                        else
                        {
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

        if (HolidayContent != null) {

            console.log('HolidayContent values');
            console.log(HolidayContent);

            var query = st.db.escape(HolidayContent.LocID) + ',' + st.db.escape(0);
            st.db.query('CALL pGetHolidayList(' + query + ')', function (err, HolidayResult) {
                console.log('CALL pGetHolidayList(' + query + ')');

                if (!err) {

                    if(HolidayResult != null)
                    {
                        if(HolidayResult[0].length > 0 )
                        {
                            console.log('FnHolidayList: Holiday List are available');
                            CallBack(null, HolidayResult[0]);
                        }
                        else
                        {
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
    var _this = this;
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
    if ( SeqNo.toString() != 'NaN' && Ezeid != null && LocID != null) {
        var Query = st.db.escape(Ezeid) + ',' + st.db.escape(SeqNo) + ',' + st.db.escape(0);
        //console.log(InsertQuery);
        st.db.query('CALL PGetBannerPicsUsers(' + Query + ')', function (err, BannerResult) {
            if (!err) {
                //console.log(InsertResult);
                if (BannerResult != null) {
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
                            console.log(exists)
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
                                    console.log(exists)
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
                res.statusCode = 500;
                res.json(null);
                console.log('FnGetBannerPicture:tmaster:' + err);
            }
        });
    }
    else {
        if (SeqNo.toString() == 'NaN') {
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
    var _this = this;
try {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var Token = req.body.Token;
    var Keyword = req.body.Keyword;
    var Latitude = req.body.Latitude;
    var Longitude = req.body.Longitude;
    var Proximity = req.body.Proximity ? req.body.Proximity : 0;
    var currentDateTime = req.body.CurrentDate;

    if (Token != null && Keyword != null && Latitude != null && Longitude != null) {
        st.validateToken(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    var query = st.db.escape(Keyword) + ','  + st.db.escape(Latitude) + ',' +
                        st.db.escape(Longitude) + ',' + st.db.escape(Proximity)+
                        ',' + st.db.escape(Token) + ',' +st.db.escape(currentDateTime);
                    console.log('CALL pTrackerSearch(' + query + ')');
                    st.db.query('CALL pTrackerSearch(' + query + ')', function (err, GetResult) {
                        console.log(GetResult);
                        if (!err) {
                            if (GetResult) {
                                if (GetResult[0]) {
                                    if (GetResult[0].length > 0) {
                                        console.log('FnSearchForTracker: Search result sent successfully');
                                        res.send(GetResult[0]);
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
        if (Token == null) {
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
    var _this = this;

    try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var find = alterEzeoneId(req.query.Keywords);
    var token = req.query.Token;
        var tid;
    //console.log(token);
    if (token != null && find != null && token != '' && find != '') {
        st.validateToken(token, function (err, Result) {
            if (!err) {
                if (Result != null) {

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
                            if (SearchResult[0] != null) {
                                if (SearchResult[0].length > 0) {
                                    SearchResult = SearchResult[0];
                                    //console.log(DocumentResult)
                                    var docs = SearchResult[0];
                                    res.setHeader('Content-Type', docs.ContentType);
                                    res.setHeader('Content-Disposition', 'attachment; filename=' + docs.Filename);
                                    //res.setHeader('Cache-Control', 'public, max-age=86400000');
                                    res.setHeader('Cache-Control', 'public, max-age=0');
                                    res.writeHead('200', { 'Content-Type': docs.ContentType });
                                    res.end(docs.Docs, 'base64');
                                    console.log('FnGetSearchDocuments: tmaster: Search result sent successfully');


                                    var getQuery = 'select masterid as TID from tloginout where Token='+st.db.escape(token);
                                    st.db.query(getQuery, function (err, getResult) {
                                        if(!err){
                                            tid = getResult[0].TID;
                                            console.log(tid);
                                        }
                                        var query = st.db.escape(tid) + ',' + st.db.escape(EZEID) + ',' + st.db.escape(req.ip) + ',' + st.db.escape(type);
                                        console.log('CALL pCreateAccessHistory(' + query + ')');

                                        st.db.query('CALL pCreateAccessHistory(' + query + ')', function (err){
                                            if(!err){
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
        if (token == null) {
            console.log('FnGetSearchDocuments: token is empty');
        }
        else if (find == null) {
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
                        if(results.length > 0){
                            if((!results[0].PIN) && results[0].IDTypeID !== 1){
                                res.redirect('/searchDetails?searchType=2&TID='+results[0].LID);
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

module.exports = Search;