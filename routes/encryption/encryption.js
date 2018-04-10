/**
 * Created by vedha on 09-11-2017.
 */

var crypto = require('crypto');
// var algorithm = 'aes-256-ctr';
var algorithm = 'aes-256-cbc';
var iv = "1234567891234567";

function Encryption(){
};

Encryption.prototype.encrypt = function encrypt(buffer,secretKey){
    var encPassword = secretKey ;
    // console.log("encPassword",encPassword);
    var password = crypto.createHash("sha256").update(encPassword).digest();
    // var iv = require('crypto').randomBytes(16);
    // var buffer = new Buffer(JSON.stringify(response), 'utf-8');
    var cipher = crypto.createCipheriv(algorithm,password,iv);
    var crypted = Buffer.concat([cipher.update(buffer),cipher.final()]);
    return crypted;
};

Encryption.prototype.decrypt = function decrypt(buffer,secretKey){
    var encPassword = secretKey;
    var password = crypto.createHash("sha256").update(encPassword).digest() ;
    // var buffer = new Buffer(response);
    var decipher = crypto.createDecipheriv(algorithm,password,iv);
    var dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);
    return dec;
};

Encryption.prototype.decrypt1 = function decrypt1(buffer,secretKey){
    buffer = new Buffer(buffer, 'base64');

    var encPassword = secretKey;
    var password = crypto.createHash("sha256").update(encPassword).digest() ;
    // var buffer = new Buffer(response);
    var decipher = crypto.createDecipheriv(algorithm,password,iv);
    var dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);
    return dec;

};

module.exports = Encryption;


