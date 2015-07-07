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

StdLib.prototype.validateToken = function(){

};

StdLib.prototype.validateTokenAp = function(){

};

StdLib.prototype.sendMail = function(){

};

module.exports = StdLib;