/**
 * Directive responsible for getting a single transaction-history according to the given style
 *
 * @author: Sandeep Gantait
 * @since: 20150526
 * @usedIn: transaction history module
 * @usage: <transaction-history-item ng-to='' ng-message='' ng-quantity='' ng-date='' ng-id=''> </transaction-history-item>
 */
(function(){
    angular.module('ezeidApp').directive('transactionHistoryItem', ['$compile','$templateCache',function ($compile,$templateCache) {

            /* All A-C-T-I-O-N starts here */

            /* main return function of the directive goes here */
            return {
                restrict: 'E',//@usage: <transaction-history-item> </transaction-history-item>
                replace:true,
                templateUrl: '../../../html/transaction-history-item.html',
                scope:{//here we define all the parameters used in this template
                    ngTo:'@',
                    ngMessage:'=',
                    ngQuantity:'=',
                    ngDate:'=',
                    ngId:'='
                }
        }
    }]);
})();