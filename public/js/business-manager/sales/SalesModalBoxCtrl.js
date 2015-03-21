angular.module('ezeidApp').controller('SalesModalBoxCtrl',['$scope','$rootScope','$http','GURL','MsgDelay','$interval','$q','$timeout','Notification',function($scope,$rootScope,$http,GURL,MsgDelay,$interval,$q,$timeout,Notification){

    /**
     * Method to clone an object
     * @param obj
     * @returns {*}
     */
    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    /**
     * Currently selected item TID (model for selectbox)
     * @type {number}
     */
    $scope.selectedItemTID = 0;

    $scope.currency = 'Rs.';
    $scope.isItemAddBlockVisible = false;
    $scope.modalTrnId = 0;
    $scope.modalItemList = [
//        {
//            TID: 21,
//            ItemName : 'New Item',
//            Rate : 300,
//            Qty : 20,
//            Amount : 5500
//        }
    ];
    $scope.modalListType = 0;
    $scope.modalTotal = 0;
    $scope.modalCurrentItem = {
        TID : 0,
        ItemName : '',
        Pic : '/images/default-item-pic.png',
        Rate : 0,
        Qty : 0,
        Amount : this.Qty * this.Rate
    };

    /**
     * Add item if not present in array and updates it if already present
     */
    $scope.modalAddItem = function(){
        if($scope.modalCurrentItem.TID !== 0 || $scope.modalCurrentItem.TID !== null || typeof($scope.modalCurrentItem.TID) !== undefined){
            var itemIndex = $scope.findItemByProperty('TID',$scope.modalCurrentItem.TID,$scope.modalItemList);
            if(itemIndex === -1){
                // Add item to list if undefined
                var x = clone($scope.modalCurrentItem);
                if(typeof(x.Qty) == "undefined" || Number.isNaN(x.Qty) || x.Qty < 1)
                {
                    x.Qty = 1;
                }
                if(typeof(x.Amount) == "undefined" || Number.isNaN(x.Amount))
                {
                    x.Amount = x.Rate * x.Qty;
                }
                $scope.modalItemList.push(x);
                Notification.success({ message: 'Item added successfully', delay : MsgDelay});
            }
            else{
                $scope.modalItemList[itemIndex].Qty = parseFloat($scope.modalItemList[itemIndex].Qty) + parseFloat($scope.modalCurrentItem.Qty);
                $scope.modalItemList[itemIndex].Amount  = parseFloat($scope.modalItemList[itemIndex].Amount) + parseFloat($scope.modalCurrentItem.Amount);
                Notification.success({ message: 'Item quantity updated', delay : MsgDelay});
            }
        }
        else{
            Notification.error({ message : 'Please select a item first', delay : MsgDelay});
        }
    };

    /**
     * Removes item from list
     * @param itemTid
     */
    $scope.modalRemoveItem = function(itemTid){
        var itemIndex = $scope.findItemByProperty('TID',itemTid,$scope.modalItemList);
        if(itemIndex !== -1){
            $scope.modalItemList.splice(itemIndex,1);
        }
        Notification.success({ message: 'Item removed successfully', delay : MsgDelay});
    };

    /**
     * Watch the value of select box and loads item details according to it
     */

    $scope.$watch('selectedItemTID',function(newVal,oldVal){
        if(newVal !== oldVal){
            var a = $scope.findItemByProperty("TID",newVal,$scope.itemList);
            if(a !== -1){
                $scope.isItemAddBlockVisible = true;
                $scope.modalCurrentItem = $scope.itemList[a];
                $scope.modalCurrentItem.Qty = 1;
                $scope.modalCurrentItem.Amount = parseFloat($scope.modalCurrentItem.Qty) * parseFloat($scope.modalCurrentItem.Rate)
            }
            else{
                $scope.isItemAddBlockVisible = false;
            }
        }
    });


    $scope.$watch('modalCurrentItem.Qty',function(newVal,oldVal){
        var qty = parseInt(newVal);
        if(typeof(qty) === "undefined" || qty < 0 || Number.isNaN(qty) || qty == null){
            $scope.modalCurrentItem.Qty = 1;
            $scope.modalCurrentAmount = $scope.modalCurrentItem.Rate * $scope.modalCurrentItem.Qty;;
        }
        else{
            if(($scope.modalCurrentItem.Qty) == "undefined" || Number.isNaN($scope.modalCurrentItem.Qty) || $scope.modalCurrentItem.Qty < 1){
                $scope.modalCurrentItem.Qty = 1;
            }
           $scope.modalCurrentItem.Amount = $scope.modalCurrentItem.Rate * $scope.modalCurrentItem.Qty;
        }
    });


    $scope.subtractValue = function(){
        if($scope.modalCurrentItem.Qty == null ||
            typeof($scope.modalCurrentItem.Qty) == "undefined" ||
            Number.isNaN($scope.modalCurrentItem.Qty)){
            $scope.modalCurrentItem.Qty = 0;
        }
        else{
            var x = $scope.modalCurrentItem.Qty - 1;
            if(x >= 0 ){
                $scope.modalCurrentItem.Qty -= 1;
            }
            else{
                $scope.modalCurrentItem.Qty = 0;
            }
        }
    };





}]);