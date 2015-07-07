var crypto = require('crypto');
console.log(crypto.getHashes());

var crypto = require("crypto");
var algo = "ecdsa-with-SHA1"
var rand = crypto.randomBytes(64).toString('hex');;
var token = crypto.createHmac(algo, rand)
    .update(Date.now().toString())
    .digest("hex");

console.log(token);