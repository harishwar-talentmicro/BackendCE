angular.module('ezeidApp').controller('PaymentInitCtrl',[
    '$http',
    '$rootScope',
    '$scope',
    'Notification',
    '$filter',
    '$q',
    '$timeout',
    'GURL',
    '$interval',
    'MsgDelay',
    function($http, $rootScope, $scope, Notification, $filter, $q, $timeout,GURL,$interval,MsgDelay) {
        $scope.$emit('$preLoaderStop');

        var paymentFormCssId = '#payment-form';


        /**
         * URL Where the payment form is to be submitted, will be a citruspay payment gateway url
         * @type {string}
         */
        $scope.paymentFormActionUrl = '';
        /**
         * Payment form parameters to be submitted to citrus pay payment gateway endpoint
         * 1. merchantTxnId
         * 2. orderAmount
         * 3. currency
         * 4. returnUrl
         * 5. secSignature
         * 6. notifyUrl
         */
        $scope._merchantTxnId = '';
        $scope._orderAmount = '';
        $scope._currency = '';
        $scope._returnUrl = '';
        $scope._secSignature = '';
        $scope._notifyUrl = '';

        /**
         * Payment form optional parameters (custom parameters) to be submitted to citrus pay payment gateway
         */
        $scope.ezPaymentTxId = 0;
        $scope.ezPlanId = 0;

        $scope.seconds = 10;
        $interval(function(){
            $scope.seconds -= 1;
        },1000);

        $scope.initiatePayment = function(subscription){
            var defer = $q.defer();
            $http({
                url : GURL + '',
                method : 'POST',
                data : {
                    token : $rootScope._userInfo.Token,
                    subscription : subscription
                }
            }).success(function(resp){

                /**
                 * API Response Format in Success case
                 *  {
                 *      "merchantTxnId" : "akagar379erqw8937489fae",
                 *      "orderAmount" : 15000,
                 *      "currency" : "INR",
                 *      "returnUrl" : "https://www.ezeone.com/payment_details.html",
                 *      "secSignature" : "aq37qrufaa38475qfa89473qrfahzhvhe78qy5ihfajhfjha8tgkjashnzneqr8tu",
                 *      "notifyUrl" : "https://www.ezeone.com/api/payment_notify",
                 *      "paymentFormActionUrl" : "https://www.citruspay.com/ezeone",
                 *      "customParams" : [
                 *          {
                 *              "name" : "ezTxId",
                 *              "value" : 5221
                 *          },
                 *          {
                 *              "name" : "subscriptionId",
                 *              "value": 3
                 *          }
                 *      ]
                 *  }
                 *
                 */


                if(resp){
                    if(resp.status){
                        $scope._merchantTxnId = resp.merchantTxnId;
                        $scope._orderAmount = resp.orderAmount;
                        $scope._currency = resp.currency;
                        $scope._returnUrl = resp.returnUrl;
                        $scope._secSignature = resp.secSignature;
                        /**
                         * Payment form notifyUrl for server to server communication
                         */
                        $scope._notifyUrl = resp.notifyUrl;

                        /**
                         * Payment form redirectUrl
                         */
                        $scope.paymentFormActionUrl = resp.paymentFormActionUrl;




                        /**
                         * Payment form optional parameters (custom parameters) to be submitted to citrus pay payment gateway
                         */
                        for(var i=0; i < resp.customParams.length; i++){
                            angular.element(paymentFormCssId).append('<input type="hidden" '+
                                ' name="customParams['+i+'].name" value="'+resp.customParams[i].title+'" />');
                            angular.element(paymentFormCssId).append('<input type="hidden" '+
                                ' name="customParams['+i+'].value" value="'+resp.customParams[i].value+'" />');
                        }


                        $timeout(function(){
                            angular.element(paymentFormCssId).trigger('submit');
                        },1000);
                    }
                    else{
                        Notification.error({
                            title : 'Error',
                            message : 'Unable to process your request! Please try again',
                            delay : MsgDelay
                        });
                    }
                }
                else{
                    Notification.error({
                        title : 'Error',
                        message : 'Unable to process your request! Please try again',
                        delay : MsgDelay
                    });
                }
            }).error(function(err,statusCode){
                var msgObj = {title : 'Connection Lost', message : 'Check your connection!', delay : MsgDelay};
                if(statusCode){
                   msgObj.title = 'Error';
                   msgObj.message = 'Unable to process your request! Please try again';
                }
                Notification.error(msgObj);
            });
            return defer.promise;
        };

    }
]);