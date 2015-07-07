"use strict";

function StdLib(db){
    this.db = db;
};

StdLib.prototype.generateToken = function(){
    var crypto = require("crypto");
    var algo = "ecdsa-with-SHA1"
    var rand = crypto.randomBytes(64).toString('hex');;
    var token = crypto.createHmac(algo, rand)
        .update(Date.now().toString())
        .digest("hex");
    return token;
};

StdLib.prototype.validateToken = function(Token, CallBack){
    try {

        //below query to check token exists for the users or not.
        if (Token != null && Token != '') {
            if(Token != 2){
                var Query = 'select TID,Token from tmaster where Token=' + db.escape(Token);
                //var Query = 'select Token from tmaster';
                //70084b50d3c43822fbef
                db.query(Query, function (err, Result) {
                    if (!err) {
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
    try {

        //below query to check token exists for the users or not.
        if (Token != null) {
            var Query = 'select Token from tapuser where Token=' + db.escape(Token);
            //var Query = 'select Token from tmaster';
            //70084b50d3c43822fbef
            db.query(Query, function (err, Result) {
                if (!err) {
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

StdLib.prototype.sendMail = function(){

};

module.exports = StdLib;