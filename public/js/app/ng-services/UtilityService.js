/**
 * Handles all utility functions which would be used system - wide
 * @Date: 20150521
 * @author: Ezeid Team
 */

angular.module('ezeidApp').service('UtilityService',['$q',function($q){
    return {


        /**
         * Get the address string
         * @author: Sandeep
         * @param addressLine1
         * @param addressLine2
         * @param city
         *
         * @usage
         */
        getAddressString : function (addressArray,characterLimit){
            var addressArr = [];

            /* setting the default character limit of address to 45 caharacters */
            characterLimit = typeof characterLimit != 'undefined'?characterLimit:45;
            for(var i=0;i<addressArray.length;i++)
            {
                if(typeof(addressArray[i]) != 'undefined' && addressArray[i].length > 0)
                {
                    addressArr.push(addressArray[i]);
                }
            }

            /* get the complete address */
            var addressStr = addressArr.join(', ');

            if(addressStr.length > characterLimit)
            {
                return addressStr.substring(0,characterLimit)+'...';
            }

            return addressStr;
        }

    };
}]);
