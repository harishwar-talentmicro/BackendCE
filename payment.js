/**
 *  @author Anjali Pandya
 *  @title payment module
 *  @since Jan 06,2015 14:21 AM IST
 *  @description Handles functions related Payment
 *  1. payment api called by cytrus
 *  2. get payment details of user
 *  3. create bill url for android app
 *
 */
'use strict';
var express = require('express');
var router = express.Router();
var validator = require('validator');
var CitrusPayment = require('../lib/CitrusPayment.js');
var paymentApi = new CitrusPayment();
var Mailer = require('../lib/mailer.js');
var mailerApi = new Mailer();
var request = require('request');
var PAYMENT_CONFIG = require('../../payment-config.json');
var CONFIG = require('../../config.json');

router.post('/mobile', function(req, res, next) {
    console.log('/mobile is executing');
    req.isMobile = 1;
    paymentApi.verifyPayment(req,res,function(parsedPaymentData,paymentVerificationCallback){
        var error  = {};
        var validationStatus = true;
        var respMsg = {
            S : false,
            M : '',
            E : {},
            D : null
        };

        if (parsedPaymentData.respStatus == 2){
            parsedPaymentData.respStatus = 0;
        }
        if (parsedPaymentData.respStatus == 0){
            parsedPaymentData.respStatus = 2;
        }

        if(!validationStatus){
            respMsg.S = false;
            respMsg.M = 'Please check the errors below';
            respMsg.E = error;
            respMsg.D = null;
            res.status(400).json(respMsg);
        }
        else {
            try {
                var procParams = req.dbConn.escape(parsedPaymentData.TxId) + ',' + req.dbConn.escape(parsedPaymentData.respStatus)
                    + ',' + req.dbConn.escape(parsedPaymentData.TxStatus) + ',' + req.dbConn.escape(parsedPaymentData.TxRefNo)
                    + ',' + req.dbConn.escape(parsedPaymentData.TxMsg) + ',' + req.dbConn.escape(parsedPaymentData.pgTxnNo)
                    + ',' + req.dbConn.escape(parsedPaymentData.issuerRefNo) + ',' + req.dbConn.escape(parsedPaymentData.authIdCode)
                    + ',' + req.dbConn.escape(parsedPaymentData.firstName) + ',' + req.dbConn.escape(parsedPaymentData.lastName)
                    + ',' + req.dbConn.escape(parsedPaymentData.pgRespCode) + ',' + req.dbConn.escape(parsedPaymentData.addressZip);

                var procQuery = 'CALL update_payment(' + procParams + ') ';
                console.log(procQuery);

                req.dbConn.query(procQuery, function (err, results) {
                    if (!err) {
                        console.log(results);
                        if(results){
                            if(results[0]){
                                if(results[0][0]){
                                    if (results[0][0].oid) {
                                        if (parsedPaymentData.respStatus == 1) {
                                            if(results[0][0].b) {
                                                var d = new Buffer(results[0][0].b);
                                                var s = d.toString('base64');
                                                var link = CONFIG.CONSTANTS.INVOICE_URL + '?inv=' + s;
                                                if (results[0][0].e) {
                                                    mailerApi.sendMail('order', {
                                                        EMAIL: results[0][0].e,
                                                        RESET_CODE: link
                                                    }, '', results[0][0].e);
                                                }
                                                /**
                                                 * To send SMS
                                                 */
                                                if (results[0][0].m) {
                                                    request({
                                                        url: 'http://sms.ssdindia.com/api/sendhttp.php',
                                                        qs: {
                                                            authkey: '11891AaSe1MQ6W57038d4b',
                                                            mobiles: results[0][0].m,
                                                            message: 'Thank you for your order with FOMADS, Your order Id is ' + results[0][0].b +
                                                            '. Click on the link to print your invoice. ' + link,
                                                            sender: 'FOMADS',
                                                            route: 4
                                                        },
                                                        method: 'GET'

                                                    }, function (error, response, body) {
                                                        if (error) {
                                                            console.log("Status code for error : " + response.statusCode);
                                                            console.log(error);
                                                        }
                                                        else {
                                                            console.log("Message sent successfully");
                                                            console.log("Messege body is :" + body);
                                                            console.log("Status Code :" + response.statusCode);
                                                        }
                                                    });
                                                }
                                                /**
                                                 * To send SMS temporary to 4 numbers and email
                                                 */
                                                var numbers = ['9035692980','9900687881','9900622531','9900687881'];
                                                //var numbers = ['9810001726','9810070786','9958805111','9599355220'];
                                                var sendSmsToKitchenAdmin = function(kitchenAdminMobileList,billNumber,customerFirstName,customerMobile,callback){
                                                    request({url: 'http://sms.ssdindia.com/api/sendhttp.php',
                                                        qs: {
                                                            authkey: '11891AaSe1MQ6W57038d4b',
                                                            //mobiles: numbers[i],
                                                            mobiles: kitchenAdminMobileList[kitchenAdminMobileList.length - 1],
                                                            message: 'You received an order '+ billNumber+ ' From ' + customerFirstName + ' with mobile number '+ customerMobile +
                                                            '. You could download invoice following this link. ' + link ,
                                                            sender: 'FOMADS',
                                                            route: 4
                                                        },
                                                        method: 'GET'

                                                    }, function (error, response, body) {
                                                        if (error) {
                                                            console.log("Status code for error : " + response.statusCode);
                                                            console.log(error);
                                                        }
                                                        else {
                                                            console.log("Message sent successfully");
                                                            console.log("Messege body is :" + body);
                                                            console.log("Status Code :" + response.statusCode);
                                                        }
                                                        kitchenAdminMobileList.pop();
                                                        if(kitchenAdminMobileList.length){
                                                            sendSmsToKitchenAdmin(kitchenAdminMobileList,callback);
                                                        }
                                                        else{
                                                            if(typeof callback == 'function'){
                                                                callback();
                                                            }
                                                        }
                                                    });
                                                };
                                                sendSmsToKitchenAdmin(numbers,results[0][0].b,results[0][0].fn,results[0][0].m,function(){
                                                    mailerApi.sendMail('invoice_order', {
                                                        EMAIL: results[0][0].e,
                                                        order: results[0][0].b,
                                                        Name: results[0][0].fn,
                                                        mn: results[0][0].m,
                                                        RESET_CODE: link
                                                    }, '', 'tinipandya19@gmail.com');
                                                    paymentVerificationCallback(results[0][0].oid);
                                                });

                                            }
                                        }
                                        else{
                                            paymentVerificationCallback(results[0][0].oid);
                                        }
                                    }
                                    else{
                                        paymentVerificationCallback(null);
                                    }
                                }
                                else{
                                    paymentVerificationCallback(null);
                                }
                            }
                            else{
                                paymentVerificationCallback(null);
                            }
                        }
                        else {
                            paymentVerificationCallback(null);
                        }
                    }
                    else {
                        console.log(err);
                        console.log('Error while performing update_payment');
                        var errorDate = new Date();
                        console.log(errorDate.toTimeString() + ' ......... error ...........');
                        paymentVerificationCallback(null);

                    }

                });
            }
            catch (ex) {
                console.log('Error in payment module');
                console.log(ex);
                var errorDate = new Date();
                console.log(errorDate.toTimeString() + ' ......... error ...........');
                paymentVerificationCallback(null);
            }
        }

    });

});

/**
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description Payment API
 *
 * @accepts json
 *
 *
 */
router.post('/', function(req, res, next) {

    paymentApi.verifyPayment(req,res,function(parsedPaymentData,paymentVerificationCallback){
       var error  = {};
       var validationStatus = true;
       var respMsg = {
           S : false,
           M : '',
           E : {},
           D : null
       };

        if (parsedPaymentData.respStatus == 2){
            parsedPaymentData.respStatus = 0;
        }
        if (parsedPaymentData.respStatus == 0){
            parsedPaymentData.respStatus = 2;
        }

        if(!validationStatus){
           respMsg.S = false;
           respMsg.M = 'Please check the errors below';
           respMsg.E = error;
           respMsg.D = null;
           res.status(400).json(respMsg);
       }
       else {
           try {
               var procParams = req.dbConn.escape(parsedPaymentData.TxId) + ',' + req.dbConn.escape(parsedPaymentData.respStatus)
                   + ',' + req.dbConn.escape(parsedPaymentData.TxStatus) + ',' + req.dbConn.escape(parsedPaymentData.TxRefNo)
                   + ',' + req.dbConn.escape(parsedPaymentData.TxMsg) + ',' + req.dbConn.escape(parsedPaymentData.pgTxnNo)
                   + ',' + req.dbConn.escape(parsedPaymentData.issuerRefNo) + ',' + req.dbConn.escape(parsedPaymentData.authIdCode)
                   + ',' + req.dbConn.escape(parsedPaymentData.firstName) + ',' + req.dbConn.escape(parsedPaymentData.lastName)
                   + ',' + req.dbConn.escape(parsedPaymentData.pgRespCode) + ',' + req.dbConn.escape(parsedPaymentData.addressZip);

               var procQuery = 'CALL update_payment(' + procParams + ') ';
               console.log(procQuery);

               req.dbConn.query(procQuery, function (err, results) {
                   if (!err) {
                       console.log(results);
                       if(results){
                           if(results[0]){
                               if(results[0][0]){
                                   if (results[0][0].oid) {
                                       if (parsedPaymentData.respStatus == 1) {
                                           if(results[0][0].b) {
                                               var d = new Buffer(results[0][0].b);
                                               var s = d.toString('base64');
                                               var link = CONFIG.CONSTANTS.INVOICE_URL + '?inv=' + s;
                                               if (results[0][0].e) {
                                                   mailerApi.sendMail('order', {
                                                       EMAIL: results[0][0].e,
                                                       RESET_CODE: link
                                                   }, '', results[0][0].e);
                                               }
                                               /**
                                                * To send SMS
                                                */
                                               if (results[0][0].m) {
                                                   request({
                                                       url: 'http://sms.ssdindia.com/api/sendhttp.php',
                                                       qs: {
                                                           authkey: '11891AaSe1MQ6W57038d4b',
                                                           mobiles: results[0][0].m,
                                                           message: 'Thank you for your order with FOMADS, Your order Id is ' + results[0][0].b +
                                                           '. Click on the link to print your invoice. ' + link,
                                                           sender: 'FOMADS',
                                                           route: 4
                                                       },
                                                       method: 'GET'

                                                   }, function (error, response, body) {
                                                       if (error) {
                                                           console.log("Status code for error : " + response.statusCode);
                                                           console.log(error);
                                                       }
                                                       else {
                                                           console.log("Message sent successfully");
                                                           console.log("Messege body is :" + body);
                                                           console.log("Status Code :" + response.statusCode);
                                                       }
                                                   });
                                               }
                                               /**
                                                * To send SMS temporary to 4 numbers and email
                                                */

                                              //var numbers = ['9035692980','9900687881','9900687881','9900687881'];
                                              // //var numbers = ['9810001726','9810070786','9958805111','9599355220'];
                                              // for( var i = 0; i < numbers.length; i++ ) {
                                              //     request({
                                              //         url: 'http://sms.ssdindia.com/api/sendhttp.php',
                                              //         qs: {
                                              //             authkey: '4936ATYNLXzPkEQ54291a26',
                                              //             mobiles: numbers[i],
                                              //             message: 'You received an order '+ results[0][0].b + ' From ' + results[0][0].fn + ' with mobile number '+ results[0][0].m +
                                              //             '. You could download invoice following this link. ' + link ,
                                              //             sender: 'FOMADS',
                                              //             route: 4
                                              //         },
                                              //         method: 'GET'
                                              //
                                              //     }, function (error, response, body) {
                                              //         if (error) {
                                              //             console.log("Status code for error : " + response.statusCode);
                                              //             console.log(error);
                                              //         }
                                              //         else {
                                              //             console.log("Message sent successfully");
                                              //             console.log("Messege body is :" + body);
                                              //             console.log("Status Code :" + response.statusCode);
                                              //         }
                                              //     });
                                              // }
                                              // mailerApi.sendMail('invoice_order', {
                                              //     EMAIL: results[0][0].e,
                                              //     order: results[0][0].b,
                                              //     Name: results[0][0].fn,
                                              //     mn: results[0][0].m,
                                              //     RESET_CODE: link
                                              // }, '', 'jain31192@gmail.com');
                                              //
                                              // paymentVerificationCallback(results[0][0].oid);

                                               mailerApi.sendMail('invoice_order', {
                                                   EMAIL: results[0][0].e,
                                                   order: results[0][0].b,
                                                   Name: results[0][0].fn,
                                                   mn: results[0][0].m,
                                                   RESET_CODE: link
                                               }, '', 'tinipandya19@gmail.com');
                                               var numbers = ['9035692980','9900687881','9900622531','7665100759'];
                                               //var numbers = ['9810001726','9810070786','9958805111','9599355220'];
                                               var sendSmsToKitchenAdmin = function(kitchenAdminMobileList,billNumber,customerFirstName,customerMobile,callback){
                                                   request({url: 'http://sms.ssdindia.com/api/sendhttp.php',
                                                       qs: {
                                                           authkey: '11891AaSe1MQ6W57038d4b',
                                                           //mobiles: numbers[i],
                                                           mobiles: kitchenAdminMobileList[kitchenAdminMobileList.length - 1],
                                                           message: 'You received an order '+ billNumber+ ' From ' + customerFirstName + ' with mobile number '+ customerMobile +
                                                           '. You could download invoice following this link. ' + link ,
                                                           sender: 'FOMADS',
                                                           route: 4
                                                       },
                                                       method: 'GET'

                                                   }, function (error, response, body) {
                                                       if (error) {
                                                           console.log("Status code for error : " + response.statusCode);
                                                           console.log(error);
                                                       }
                                                       else {
                                                           console.log("Message sent successfully");
                                                           console.log("Messege body is :" + body);
                                                           console.log("Status Code :" + response.statusCode);
                                                       }
                                                       kitchenAdminMobileList.pop();
                                                       if(kitchenAdminMobileList.length){
                                                           sendSmsToKitchenAdmin(kitchenAdminMobileList,callback);
                                                       }
                                                       else{
                                                           if(typeof callback == 'function'){
                                                               callback();
                                                           }
                                                       }
                                                   });
                                               };
                                               sendSmsToKitchenAdmin(numbers,results[0][0].b,results[0][0].fn,results[0][0].m,function(){
                                                   paymentVerificationCallback(results[0][0].oid);
                                               });

                                           }
                                       }
                                       else{
                                           paymentVerificationCallback(results[0][0].oid);
                                       }
                                   }
                                   else{
                                       paymentVerificationCallback(null);
                                   }
                               }
                               else{
                                   paymentVerificationCallback(null);
                               }
                           }
                           else{
                               paymentVerificationCallback(null);
                           }
                       }
                       else {
                           paymentVerificationCallback(null);
                       }
                   }
                   else {
                       console.log(err);
                       console.log('Error while performing update_payment');
                       var errorDate = new Date();
                       console.log(errorDate.toTimeString() + ' ......... error ...........');
                       paymentVerificationCallback(null);

                   }

               });
           }
           catch (ex) {
               console.log('Error in payment module');
               console.log(ex);
               var errorDate = new Date();
               console.log(errorDate.toTimeString() + ' ......... error ...........');
               paymentVerificationCallback(null);
           }
       }

   });

});

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description  This API will give details of payment status.
 *
 *
 *
 * @param orderId <string> orderId is bill number of order
 *
 */
router.get('/', function(req, res, next) {

    var error  = {};
    var validationStatus = true;
    var respMsg = {
        S : false,
        M : '',
        E : {},
        D : null
    };
    /*
     *      Validations
     */

    if(!validationStatus){
        respMsg.S = false;
        respMsg.M = 'Please check the errors below';
        respMsg.E = error;
        respMsg.D = null;
        res.status(400).json(respMsg);
    }
    else {

        try {
            //var bn = pad(req.query.bn);
            var procParams = req.dbConn.escape(req.query.orderId);
            var procQuery = 'CALL get_payment_details(' + procParams + ')';
            console.log(procQuery);

            req.dbConn.query(procQuery, function (err, results) {
                if (!err) {
                    console.log(results);
                    if (results) {
                        if (results[0]) {
                            if (results[0].length > 0) {

                                respMsg.S = true;
                                respMsg.M = 'Payment details loaded successfully';
                                respMsg.E = null;
                                respMsg.D = {
                                    li: results[0]
                                };
                                res.status(200).json(respMsg);

                            }
                            else {
                                respMsg.S = true;
                                respMsg.M = 'Payment details are not available';
                                respMsg.E = null;
                                respMsg.D = null;
                                res.status(200).json(respMsg);
                            }
                        }
                        else {
                            respMsg.S = true;
                            respMsg.M = 'Payment details are not available';
                            respMsg.E = null;
                            respMsg.D = null;
                            res.status(200).json(respMsg);
                        }

                    }
                    else {
                        respMsg.S = true;
                        respMsg.M = 'Payment details are not available';
                        respMsg.E = null;
                        respMsg.D = null;
                        res.status(200).json(respMsg);
                    }
                }
                else {
                    console.log(err);
                    console.log('Error while performing get_payment_details');
                    respMsg.S = false;
                    respMsg.M = 'An error occurred';
                    respMsg.E = {server: 'Internal Server Error'};
                    respMsg.D = null;
                    res.status(500).json(respMsg);

                }


            });
        }
        catch (ex) {
            console.log('Error in kitchen_order module');
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' .........error ...........');
            respMsg.S = false;
            respMsg.M = 'An error occurred';
            respMsg.E = {server: 'Internal server error'};
            respMsg.D = null;
            res.status(500).json(respMsg);
        }
    }
});

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description  This API will give details of payment status for android .
 *
 * @param txId <string> txId is transaction id
 *
 */
router.get('/android_bill/:txId', function(req, res, next) {

    var error  = {};
    var validationStatus = true;
    var respMsg = {
        S : false,
        M : '',
        E : {},
        D : null
    };
    /*
     *      Validations
     */
    if (!req.params.txId){
        error.txId = 'Invalid Transaction ID';
        validationStatus *= false;

    }

    if(!validationStatus){
        respMsg.S = false;
        respMsg.M = 'Please check the errors below';
        respMsg.E = error;
        respMsg.D = null;
        res.status(400).json(respMsg);
    }
    else {

        try {

            var procParams = req.dbConn.escape(req.params.txId);
            var procQuery = 'CALL get_payment_android_bill(' + procParams + ')';
            console.log(procQuery);
            req.dbConn.query(procQuery, function (err, results) {
                if (!err) {
                    console.log(results);
                    if (results) {
                        if (results[0]) {
                            if (results[0][0]){
                                if (results[0][0].merchantTxnId) {

                                    var txAmountObj = {
                                        value : (results[0][0].amount) ? results[0][0].amount.toFixed(2) : null,
                                        currency : PAYMENT_CONFIG.CURRENCY
                                    };
                                    var bill = {
                                        merchantTxnId: results[0][0].merchantTxnId,
                                        amount: txAmountObj,
                                        requestSignature: paymentApi.generateTxSignatureForMobile(results[0][0].merchantTxnId,results[0][0].amount),
                                        merchantAccessKey: PAYMENT_CONFIG.MERCHANT_ACCESS_KEY,
                                        returnUrl: PAYMENT_CONFIG.MOBILE_RETURN_URL
                                    };
                                    res.status(200).json(bill);

                                }
                                else {
                                    respMsg.S = true;
                                    respMsg.M = 'Transaction ID not found';
                                    respMsg.E = null;
                                    respMsg.D = null;
                                    res.status(404).json(respMsg);
                                }
                            }
                            else {
                                respMsg.S = true;
                                respMsg.M = 'Transaction ID not found';
                                respMsg.E = null;
                                respMsg.D = null;
                                res.status(404).json(respMsg);
                            }
                        }
                        else {
                            respMsg.S = true;
                            respMsg.M = 'Transaction ID not found';
                            respMsg.E = null;
                            respMsg.D = null;
                            res.status(404).json(respMsg);
                        }

                    }
                    else {
                        respMsg.S = true;
                        respMsg.M = 'Transaction ID not found';
                        respMsg.E = null;
                        respMsg.D = null;
                        res.status(404).json(respMsg);
                    }
                }
            else {
                console.log(err);
                console.log('Error while performing get_payment_details');
                respMsg.S = false;
                respMsg.M = 'An error occurred';
                respMsg.E = {server: 'Internal Server Error'};
                respMsg.D = null;
                res.status(500).json(respMsg);

            }


        });
    }
        catch (ex) {
            console.log('Error in payment module');
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' .........error ...........');
            respMsg.S = false;
            respMsg.M = 'An error occurred';
            respMsg.E = {server: 'Internal server error'};
            respMsg.D = null;
            res.status(500).json(respMsg);
        }
    }
});

module.exports = router;