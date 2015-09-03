app.post('/payment_details',function(req,res,next){

});

app.post('/payment',function(req,res,next){

    var crypto = require('crypto');

    //Need to change with your Secret Key
    var secretKey = "ebe3f8339c4fa3b99c3ecb504849dd886e79d876";

    //Need to change with your Vanity URL Key from the citrus panel
    var vanityUrl = "Your-vanityUrlPart";
    var paymentData = vanityUrl+req.body.orderAmount+req.body.merchantTxnId+req.body.currency;

    /**
     * Generating Checksum hash to validate the payment authenticity
     */
    var secSignature = crypto.createHmac('sha1', secretKey).update( paymentData).digest('hex');
    var notifyUrl = '';

    var respMsg = {
        "merchantTxnId" : "akagar379erqw8937489fae",
        "orderAmount" : 15000,
        "currency" : "INR",
        "returnUrl" : "https://www.ezeone.com/payment_details.html",
        "secSignature" : "aq37qrufaa38475qfa89473qrfahzhvhe78qy5ihfajhfjha8tgkjashnzneqr8tu",
        "notifyUrl" : "https://www.ezeone.com/api/payment_notify",
        "paymentFormActionUrl" : "https://www.citruspay.com/ezeone",
        "customParams" : [
            {
                "name" : "ezTxId",
                "value" : 5221
            },
            {
                "name" : "subscriptionId",
                "value": 3
            }
        ]
    };


    res.json(respData);
});



