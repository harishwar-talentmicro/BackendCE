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

var path ='D:\\EZEIDBanner\\';
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
                        if (Result) {
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
                                    if (SearchResult[0]) {
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
                        if (SearchResult[0]) {
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
        var ezeTerm = req.query.ezeTerm;
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
            var SearchParameter = _this.db.escape(Token) + ',' + _this.db.escape(WorkingDate) + ',' + _this.db.escape(IPAddress) + ',' + _this.db.escape(EZEID) + ',' + _this.db.escape(LocSeqNo) + ',' + _this.db.escape(Pin);
            console.log('CALL pSearchInformationNew(' + SearchParameter + ')');
            _this.db.query('CALL pSearchInformationNew(' + SearchParameter + ')', function (err, UserInfoResult) {
                // _this.db.query(searchQuery, function (err, SearchResult) {
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
        //throw new Error(ex);
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
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var async = require('async');
                        async.parallel([ function FnWorkingHours(CallBack) {
                            try {

                                var query = _this.db.escape(Token) + ',' + _this.db.escape(LocID);
                                _this.db.query('CALL pGetWorkingHours(' + query + ')', function (err, WorkingResult) {
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
                            }
                        } ,function FnHolidayList(CallBack) {
                            try {
                                var query = _this.db.escape(LocID) + ',' + _this.db.escape(0);
                                _this.db.query('CALL pGetHolidayList(' + query + ')', function (err, HolidayResult) {
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
        //throw new Error(ex);
    }
};

function FnWorkingHours(WorkingContent, CallBack) {
    try {

        if (WorkingContent != null) {

            console.log('WorkingContent values');
            console.log(WorkingContent);

            var query = _this.db.escape(WorkingContent.Token) + ',' + _this.db.escape(WorkingContent.LocID);
            _this.db.query('CALL pGetWorkingHours(' + query + ')', function (err, WorkingResult) {
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
    }
};

function FnHolidayList(HolidayContent, CallBack) {
    try {

        if (HolidayContent != null) {

            console.log('HolidayContent values');
            console.log(HolidayContent);

            var query = _this.db.escape(HolidayContent.LocID) + ',' + _this.db.escape(0);
            _this.db.query('CALL pGetHolidayList(' + query + ')', function (err, HolidayResult) {
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
    var Ezeid = req.query.Ezeid;
    var LocID = req.query.LocID;
    // var TokenNo = req.query.Token;

    RtnMessage = {
        Picture: ''
    };
    var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
    Ezeid = Ezeid.split(',').pop();
    if ( SeqNo.toString() != 'NaN' && Ezeid != null && LocID != null) {
        var Query = _this.db.escape(Ezeid) + ',' + _this.db.escape(SeqNo) + ',' + _this.db.escape(0);
        //console.log(InsertQuery);
        _this.db.query('CALL PGetBannerPicsUsers(' + Query + ')', function (err, BannerResult) {
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
                        fs = require('fs');
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
    var Proximity = req.body.Proximity;

    if (Token != null && Keyword != null && Latitude != null && Longitude != null && Proximity  != null) {
        FnValidateToken(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    var query = _this.db.escape(Keyword) + ','  + _this.db.escape(Latitude) + ',' + _this.db.escape(Longitude) + ',' + _this.db.escape(Proximity)+ ',' + _this.db.escape(Token);
                    _this.db.query('CALL pTrackerSearch(' + query + ')', function (err, GetResult) {
                        if (!err) {
                            if (GetResult != null) {
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
}
};

module.exports = Search;