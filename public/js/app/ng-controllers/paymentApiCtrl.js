/**
 * Handles the payment API integration
 *
 * @author Sandeep Gantait
 * @since 20150615
 */

var res = angular.module('ezeidApp').
    controller('paymentApiCtrl', [
        '$rootScope',
        '$scope',
        '$http',
        '$q',
        '$timeout',
        'Notification',
        '$filter',
        '$window',
        'GURL',
        '$interval',
        'MsgDelay',
        '$location',
        '$routeParams',
        'GoogleMaps',
        '$route',
        'UtilityService',
        function (
            $rootScope,
            $scope,
            $http,
            $q,
            $timeout,
            Notification,
            $filter,
            $window,
            GURL,
            $interval,
            MsgDelay,
            $location,
            $routeParams,
            GoogleMap,
            $route,
            UtilityService
        ) {

            ////console.log($.citrus);
            var citruspg = $.citrus.gateway($.citrus.env.sandbox);//calling the function in citrus.js [388]
            var citruswallet = $.citrus.wallet($('#walletToken').val(), $.citrus.env.sandbox);//calling the function in citrus.js [519]
            /**
             * All citrus payment settings goes here
             */
            $scope.merchantAccessKey = 'YRX3BRJBX71D5BMKXZUU';
            $scope.returnUrl = 'http://localhost:3001/payment/response';
            $scope.requestSignature = '';
            //Secret key:639be909a44882ee4d2816b126f3df869f84e44e
            $scope.paramOne = 'one Value';
            $scope.secundo = 'online';
            $scope.currency = 'INR';

            /**
             * list of all the available banks with their codes
             */
            $scope.bankLists =
                [
                    'ICICI Bank','AXIS Bank','Citibank','YES Bank','SBI Bank','Deutsche Bank','Union Bank',
                    'Indian Bank','Federal Bank','HDFC Bank','IDBI Bank','State Bank of Hyderabad',
                    'State Bank of Bikaner and Jaipur','State Bank of Mysore','State Bank of Travancore',
                    'Andhra Bank','Bank of Bahrain & Kuwait','Bank of Baroda Corporate Accounts',
                    'Bank of India','Bank of Baroda Retail Accounts','Bank of Maharashtra',
                    'Catholic Syrian Bank','Central Bank of India','City Union Bank','Corporation Bank',
                    'DCB Bank ( Development Credit Bank )','Indian Overseas Bank','IndusInd Bank',
                    'ING Vysya Bank','Jammu & Kashmir Bank','Karnataka Bank','Karur Vysya Bank',
                    'Kotak Mahindra Bank','Lakshmi Vilas Bank NetBanking','Oriental Bank of Commerce',
                    'Punjab National Bank Corporate Accounts',
                    'South Indian Bank','Standard Chartered Bank','Syndicate Bank',
                    'Tamilnad Mercantile Bank','United Bank of India','Vijaya Bank'
                ];

            /**
             * Ressponsible for the payment API initiation
             */
             $scope.paynow = function(paymentType) {
                // reset errors
                $('#payerror').html('');

                // create bill
                var bill = {
                    merchantAccessKey: $scope.merchantAccessKey,//
                        merchantTxnId: $('#merchantTxnId').html(),//
                    amount: {
                        currency: $scope.currency,//
                        value: $('#amount').html()//
                    },
                    returnUrl: $scope.returnUrl,//
                    requestSignature: $scope.requestSignature,//

                    userDetails: {//
                        firstName: $scope.firstName,
                        lastName: $scope.lastName,
                        email: $scope.email,
                        mobileNo: $scope.mobileNo,
                        address: {
                            street1: $scope.addressStreet1,
                            street2: $scope.addressStreet2,
                            city: $scope.addressCity,
                            zip: $scope.addressZip,
                            state: $scope.addressState,
                            country: 'INDIA'
                        }
                    },

                    customParameters: {
                        paramOne: $scope.paramOne,
                        secundo: $scope.secundo
                    }
                };

                // read payment options
                var mode = paymentType;
                var paymentOptions = {
                    mode: mode,
                    token: $('input[type="radio"][name="walletToken"]:checked').attr('id'),
                    tokenCvv: $('input[type="radio"][name="walletToken"]:checked + label input.cvv').val(),
                    cardNumber: $('#cardNumber').val(),
                    cardHolder: mode == 'card' ? $('#cardHolder').val() : $('#prepaidCardHolder').val(),
                    cardExpiry: $('#cardExpiry').val(),
                    cardCvv: $('#cardCvv').val(),
                    bankCode: $('#bank option:selected').val()
                };
                ////console.log(bill,paymentOptions);
                // make payment - calling the function defined in citrus.js [280]
                citruspg.makePayment(
                    bill,
                    paymentOptions,
                    function(error, redirect) {
                        if (error) {
                            // redirect
                            $('#payerror').html('<p>' + error.error + ': ' + error.message + '</p>');
                        }
                        else {
                            // save payments option in wallet
                            citruswallet.save(paymentOptions);

                            // display error
                            $(location).attr({ href: redirect });
                        }
                    }
                );
            }

        }
    ]);