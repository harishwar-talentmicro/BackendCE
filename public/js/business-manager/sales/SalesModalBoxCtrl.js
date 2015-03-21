angular.module('ezeidApp').controller('SalesModalBoxCtrl',['$scope','$rootScope','$http','GURL','MsgDelay','$interval','$q','$timeout','Notification',function($scope,$rootScope,$http,GURL,MsgDelay,$interval,$q,$timeout,Notification){

    /**
     * @test Code
     * @type {string}
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
        Amount : 0
    };

    /**
     * Add item if not present in array and updates it if already present
     */
    $scope.modalAddItem = function(){
        console.log($scope.modalItemList);
        if($scope.modalCurrentItem.TID !== 0 || $scope.modalCurrentItem.TID !== null || typeof($scope.modalCurrentItem.TID) !== undefined){
            console.log($scope.modalCurrentItem.TID);
            var itemIndex = $scope.findItemByProperty('TID',$scope.modalCurrentItem.TID,$scope.modalItemList);
            console.log(itemIndex);
            if(itemIndex === -1){
                console.log('Item index -1');
                // Add item to list if undefined
                var x = $scope.modalCurrentItem;
                $scope.modalItemList.push(x);

                Notification.success({ message: 'Item added successfully', delay : MsgDelay});
            }
            else{
                console.log('Item index : '+ itemIndex);
                $scope.modalItemList[itemIndex].Qty += $scope.modalCurrentItem.Qty;
                $scope.modalItemList[itemIndex].Amount += $scope.modalCurrentItem.Amount;
                Notification.success({ message: 'Item quantity updated', delay : MsgDelay});
            }
            console.log($scope.modalItemList);
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
        var itemIndex = $scope.findItemByProperty(itemTid,'TID',$scope.modalItemList);
        if(itemIndex !== -1){
            $scope.modalItemList.splice(1,itemIndex);
        }
        Notification.success({ message: 'Item removed successfully', delay : MsgDelay});
    };

    /**
     * Watch the value of select box and loads item details according to it
     */
    $scope.$watch('modalCurrentItem.TID',function(newVal,oldVal){
        console.log('newVal : '+newVal);
        console.log('oldVal : '+oldVal);
        if(newVal !== oldVal){
            var a = $scope.findItemByTid(newVal);
            console.log(a);
            if(a){
                $scope.isItemAddBlockVisible = true;
                $scope.modalCurrentItem = a;
                $scope.modalCurrentItem.Qty = 1;
            }
            else{
                $scope.isItemAddBlockVisible = false;
            }
        }
    });


    $scope.$watch('modalCurrentItem.Qty',function(newVal,oldVal){
        var qty = parseInt(newVal);
        if(typeof(qty) === "undefined" || qty < 0 || Number.isNaN(qty) || qty == null){
            $scope.modalCurrentItem.Qty = 0;
        }
        else{
           $scope.modalCurrentItem.Amount = $scope.modalCurrentItem.Rate * $scope.modalCurrentItem.Qty;
        }
    });


    $scope.addValue = function(){
        if($scope.modalCurrentItem.Qty == null ||
            typeof($scope.modalCurrentItem.Qty) == "undefined" ||
            Number.isNaN($scope.modalCurrentItem.Qty)){
            $scope.modalCurrentItem.Qty = 0;
        }
        else{
            $scope.modalCurrentItem.Qty += 1;
        }
    };

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