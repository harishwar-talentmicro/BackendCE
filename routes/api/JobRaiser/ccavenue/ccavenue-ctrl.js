var request = require('request');
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey = appConfig.DB.secretKey;
const ccav = require('./ccavutil.js');

var ccavCtrl = {};
var error = {};


ccavCtrl.getRSAKey = function (req, res, next) {


    const strOrderId = req.body.order_id; // req.body.order_id random generated id sent from Mobile App/Web View.
    const strRSAUrl = "https://secure.ccavenue.ae/transaction/getRSAKey"; //CCAvenue test url.Change it when migrating to prod.
    const accessCode = appConfig.DB.accessCode; //access code provided by CCAvenue.
    console.log("strOrderId", strOrderId);
    request.post({
        url: strRSAUrl,
        // agentOptions: {
        //     ca: fs.readFileSync(caFile)
        // },
        form: {
            access_code: accessCode,
            order_id: strOrderId
        }
    }, function (error, response, body) {
        console.log("rsa response", body);
        console.log("rsa error", error);

        res.send(body);
    });

}


ccavCtrl.ccavRespDecrytAndSaveTrans = function (req, res, next) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };


    var workingKey = appConfig.DB.workingKey; //working Key provided by CCAvenue
    var ccavResponse = '';

    try {
        console.log("req.body", req.body);
        let encryption = req.body.encResp;
        ccavResponse = ccav.decrypt(encryption, workingKey);
        console.log("ccavResponse", ccavResponse);

        if (typeof (ccavResponse) == "string") {
            ccavResponse = JSON.parse(ccavResponse);
        }

        // let jsonResponseField = {};
        // const arrCcavEncResponse = ccavResponse.split('&');
        // arrCcavEncResponse.forEach(function (strOneField) {
        //     let arrField = strOneField.split('=');
        //     jsonResponseField[arrField[0]] = arrField[1];
        // });
        //jsonResponseField will decrypted data sent by CCAevenue.
        // console.log('jsonResponseField', jsonResponseField);
        // response.data = jsonResponseField;
        // res.status(200).json(response);

        res.send(ccavResponse);

        // if (ccavResponse.order_status && ccavResponse.order_status.toLowerCase() == "success") {
        //     res.send("Success");
        // } else if (ccavResponse.order_status && ccavResponse.order_status.toLowerCase() == "failure") {
        //     res.send("Failure");
        // } else if (ccavResponse.order_status && ccavResponse.order_status.toLowerCase() == "aborted") {
        //     res.send("Aborted");
        // } else {
        //     res.send("Security Error. Illegal access detected");
        // }


    } catch (ex) {
        console.log(ex);
        res.send(ex.toString());

    }

};

module.exports = ccavCtrl;