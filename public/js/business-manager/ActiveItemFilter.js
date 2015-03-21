/**
 * Filters active items from list (whose status is 1 : Active)
 * Works for sales, reservation, home delivery, service and resume (All)
 */
angular.module('ezeidApp').filter('activeItem',function(){
    return function(items){
        var filteredItems = [];
        items.forEach(function(item,index){
            for(var prop in item){
                if(item.hasOwnProperty(prop) && (prop == 'Status') && (item.Status == 1)){
                    filteredItems.push(item);
                }
            }
        });

        return filteredItems;
    };
});