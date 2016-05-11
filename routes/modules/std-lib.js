"use strict";


function error(err, req, res, next) {
    // log it
    console.error(err.stack);
    console.log('Error Occurred Please try Again..');
    // respond with 500 "Internal Server Error".
    res.json(500,{ status : false, message : 'Internal Server Error', error : {server : 'Exception'}});
};


function StdLib(db){
    this.db = db;
};

/**
 *
 * @param ip
 * @param userAgent
 * @param ezeoneId
 * @param callBack function (err,token)
 */
StdLib.prototype.generateToken = function(ip,userAgent,ezeoneId,callBack){
    var _this = this;
    /////////////////////////////////////////////////////////////////////

    var deviceType = 1;
    var deviceMapping = {
        web : 1,
        android : 2,
        ios : 3,
        windowsPhone : 4,
        windowsApp :  5
    };

    var preUserAgents = {
        android : '$__EZEONE_|_2015_|_ANDROID_|_APP__$',
        ios : 'E-Z-E-O-N-E-!0s-APP-2015',
        windowsPhone : '|eZeOnE_wInDoWs_pHoNe_2O!5|',
        windowsApp : '$_wiNDowS_pcAPp_2015_$'
    };

    for(var agent in preUserAgents){
        if(preUserAgents.hasOwnProperty(agent) && preUserAgents[agent] === userAgent){
            deviceType = deviceMapping[agent];
            break;
        }
    }


    var tokenGenQueryParams = _this.db.escape(ip) + ',' + _this.db.escape(userAgent)
        + ',' + _this.db.escape(ezeoneId) + ',' + _this.db.escape(deviceType);
    var tokenGenQuery = 'CALL pGenerateTokenNew('+tokenGenQueryParams + ')';

    console.log(tokenGenQuery);

    _this.db.query(tokenGenQuery,function(err,results){
       if(err){
           callBack(err,null);
       }
        else{
           if(results){
                if(results[0]){
                    if(results[0][0]){
                        if(results[0][0].token){
                            callBack(null,results[0][0].token);
                        }
                        else{
                            callBack(null,null);
                        }
                    }
                    else{
                        callBack(null,null);
                    }
                }
                else{
                    callBack(null,null);
                }
           }
           else{
               callBack(null,null);
           }
       }
    });


};

/**
 * List of groupTids and their respected EZEID(GroupName) from tmGroups table
 * @param masterIdList [Array]
 * @param groupMasterCallback [Callback Function]
 */
StdLib.prototype.getGroupMasterIdList = function(masterIdList,groupMasterCallback){
    var _this = this;
    if((typeof(groupMasterCallback)).toString() !== "function"){
        groupMasterCallback = function(error,res){
            console.log('No callback passed to getGroupMasterIdList');
            if(error){
                console.log('Error in getGroupMasterIdList');
                console.log(error);
            }
            else{
                console.log(res);
            }
        };
    }


    if(masterIdList){
        if(masterIdList.length){
            /**
             * @todo IPHONE ID has to be fetched
             * @type {string}
             */
            for(var ctx = 0; ctx  < masterIdList.length; ctx++){
                masterIdList[ctx] = _this.db.escape(masterIdList[ctx]);
                masterIdList[ctx] = parseInt(masterIdList[ctx]);
            }

            var query = "SELECT tid,GroupName FROM tmgroups WHERE GroupType = 1 AND  AdminID IN ("+
                (masterIdList.join(',')) + ")";

            console.log(query);

            _this.db.query(query,function(err,results){
                if(err){
                    console.log('Error in getGroupMasterIdList');
                    console.log(err);
                    groupMasterCallback(err,null);
                }
                else{
                    groupMasterCallback(null,results);
                }
            });
        }
        else{
            console.log('No masterIdList passed to getGroupMasterIdList');
        }
    }
    else{
        console.log('No masterIdList passed to getGroupMasterIdList');
    }
};

StdLib.prototype.generateRandomHash = function(timeStamp){
    var crypto = require('crypto');
    var hash = crypto.createHash('sha1');
    if(!timeStamp){
        timeStamp = Date.now().toString();
    }
    hash.update(timeStamp.toString());
    return hash.digest('hex') + crypto.randomBytes(30).toString('hex');
}

StdLib.prototype.validateToken = function(Token, CallBack){
    var _this = this;
    console.log('validateToken');

    try {

        //below query to check token exists for the users or not.
        if (Token) {
            if(Token != 2){
                /**
                 * @info : Token is now queried from session table i.e. tloginout
                 */
                var Query = 'select masterid,token from tloginout where token=' + _this.db.escape(Token)+' AND status = 1';

               _this.db.query(Query, function (err, Result) {
                    if (!err) {
                        if(Result && Result.length){
                                // console.log(Result);
                                console.log('FnValidateToken: Token found');
                                CallBack(null, Result[0]);
                        }
                        else{
                            CallBack(null, null);
                            console.log('FnValidateToken:No Token found');
                        }

                    }
                    else {
                        CallBack(err, null);
                        console.log('FnValidateToken:' + err);

                    }
                });
            }
            else{
                CallBack(null, 'Pass');
            }
        }
        else {
            CallBack(null, null);
            console.log('FnValidateToken: Token is empty');
        }

    }
    catch (ex) {
        console.log('OTP FnValidateToken error:' + ex.description);

        return 'error'
    }
};

StdLib.prototype.validateTokenAp = function(Token, CallBack){
    var _this = this;
    console.log('validateToken AP');
    try {

        //below query to check token exists for the users or not.
        if (Token) {
            var Query = 'select Token from tapuser where Token=' +_this.db.escape(Token);
            //var Query = 'select Token from tmaster';
            //70084b50d3c43822fbef
           _this.db.query(Query, function (err, Result) {
                if (!err) {
                    if(Result) {
                        if (Result.length > 0) {
                            // console.log(Result);
                            console.log('FnValidateToken: Token found');
                            CallBack(null, Result[0]);
                        }
                        else {
                            CallBack(null, null);
                            console.log('FnValidateToken:No Token found');
                        }
                    }
                    else {
                        CallBack(null, null);
                        console.log('FnValidateToken:No Token found');
                    }
                }
                else {
                    CallBack(err, null);
                    console.log('FnValidateToken:' + err);

                }
            });
        }
        else {
            CallBack(null, null);
            console.log('FnValidateToken: Token is empty');
        }

    }
    catch (ex) {
        console.log('OTP FnValidateToken error:' + ex.description);

        return 'error'
    }
};


/**
 * Getting business is open or not based on calculation of working hours
 * @param openStatusParam
 * @param workingHoursStrParam
 * @returns {number} OpenClose Status , 2 for Close and 1 for Open
 */
StdLib.prototype.getOpenStatus = function(openStatusParam,workingHoursStrParam){
    /**
     * Considering optimistically as closed
     * and then performing the logic to find it if the business is open or not
     *
     * Vedha is giving openStatusParam as 0 in case it is not a holiday else
     * she is giving 1 if holiday so direclty we can decide business is closed
     */
    var openStatus = 2;
    if(openStatusParam){
        return openStatus;
    }
    else{

        /**
         * Splitting working hours set
         */
        var workingHoursRes = (workingHoursStrParam) ? workingHoursStrParam.split('^') :[];

        var currentDateObj = new Date();

        /**
         * Current Time in minutes
         */
        var currentTimeInMinutes = (currentDateObj.getHours() * 60) + currentDateObj.getMinutes;

        var currentDay = currentDateObj.getDay();

        if(workingHoursRes.length){
            for(var counter1 = 0; counter1 < workingHoursRes.length; counter1++){
                var workingHourComponents = (workingHoursRes[counter1]) ? workingHoursRes[counter1].split('-') : [];

                if(workingHourComponents.length){

                    /**
                     * Working hours component
                     */

                    var workingHourComponentObj = {
                        tid : (workingHourComponents[0]) ? workingHourComponents[0] : 0,
                        masterId : (workingHourComponents[1]) ? workingHourComponents[1] : 0,
                        days : (workingHourComponents[2]) ? workingHourComponents[2].split(',') : [],
                        startTime : (workingHourComponents[3]) ? workingHourComponents[3] : 0,
                        endTime : (workingHourComponents[4]) ? workingHourComponents[4] : 0
                    };


                    if(currentTimeInMinutes >= workingHourComponentObj.startTime && currentTimeInMinutes <= workingHourComponentObj.endTime && workingHourComponentObj.days.indexOf(currentDay.toString) !== -1){
                        openStatus = 1;
                        break;
                    }

                }

            }

        }

        return openStatus;
    }
};

function FnSendMailEzeid(MailContent, CallBack) {
    var _this = this;
    try {

        //below query to check token exists for the users or not.
        if (MailContent) {
            //var Query = 'select Token from tmaster';
            //70084b50d3c43822fbef
            var RtnResponse = {
                IsSent: false
            };
            var RtnResponse = JSON.parse(JSON.stringify(RtnResponse));
            var nodemailer = require('nodemailer');
            var smtpTransport = require('nodemailer-smtp-transport');
            var transporter = nodemailer.createTransport(smtpTransport({
                host: 'mail.name.com',
                port: 25,
                auth: {
                    user: 'noreply@ezeid.com',
                    pass: 'Ezeid2015'
                }
            }));
            transporter.sendMail(MailContent, function (error, info) {
                if (error) {
                    console.log('FnSendMailEzeid: sending mail error ' + error);
                    CallBack(null, null);
                }
                else {
                    console.log('FnSendMailEzeid: Message sent: ' + info.response);
                    RtnResponse.IsSent = true;
                    CallBack(null, RtnResponse);
                }
            });
        }
        else {
            CallBack(null, null);
            console.log('FnSendMailEzeid: Token is empty');
        }

    }
    catch (ex) {
        console.log('OTP FnSendMailEzeid error:' + ex.description);

        return 'error'
    }
};



module.exports = StdLib;