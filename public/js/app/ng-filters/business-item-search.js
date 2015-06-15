(function(){
    angular.module('ezeidApp').filter('businessItemSearch',function(){
        return function(itemList,searchTerm){
            if(!itemList){
                return [];
            }
            if(!searchTerm){
                return itemList;
            }

            var returnList = [];
            var regex = new RegExp(searchTerm);
            for(var i=0; i< itemList.length; i++){
                if(regex.test(itemList[i].ItemName)){
                    returnList.push(itemList[i]);
                }
                else if(regex.test(itemList[i].ItemName.toUpperCase())){
                    returnList.push(itemList[i]);
                }
            }
            return returnList;
        };
    });
})();