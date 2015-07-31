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
        },

        /* checks if the variabe is existing and have a value */
        isExists : function(param)
        {
            if(typeof param != 'undefined' && param.toString().length > 0)
            {
                return param;
            }
            return false;
        },

        /**
         * Convert date to UTC format
         */
        convertTimeToLocal : function(timeFromServer,dateFormat){
            if(!dateFormat){
                dateFormat = 'DD-MMM-YYYY hh:mm A';
            }
            var mom1 = moment(timeFromServer,dateFormat);
            var ret =  mom1.add((mom1.utcOffset()),'m').format(dateFormat);
            return ret;
        },

        /**
         * Function for converting LOCAL time (local timezone) to server time
         */
        convertTimeToUTC : function(localTime, dateFormat) {
            if (!dateFormat) {
                dateFormat = 'YYYY-MM-DD HH:mm';
            }
            return moment(localTime).utc().format(dateFormat);
        },

        /**
         * Check if the value is undefined
         */
        chkIfUndefined : function(val)
        {
            if(val != 'undefined')
            {
                return val;
            }
            return false;
        },

        /**
         * check if the value is empty
         */
        checkIfEmpty : function(val,alternateText)
        {
            if($.trim(val).length > 0)
            {
                return val;
            }

            if(typeof(alternateText) != 'undefined')
            {
                return alternateText;
            }

            return val;
        },

        /**
         * Truncate a string up to a certain character
         */
        truncate : function(str, limit)
        {
            if(toString(str).length > limit)
            {
                return str.substring(0,limit)+"...";
            }
            return str;
        },

        /**
         * get range of everything
         */
        getRange : function(rangeFrom,rangeTo,code)
        {
            if(!parseInt(rangeFrom) > 0 && !parseInt(rangeTo) > 0)
            {
                return  "NA";
            }
            if(parseInt(rangeFrom) == parseInt(rangeTo))
            {
                return rangeFrom;
            }
            else if(parseInt(rangeFrom) < parseInt(rangeTo))
            {
                return rangeFrom+"-"+rangeTo;
            }
            else
            {
                return rangeTo+"-"+rangeFrom;
            }
        },

        /**
         * Currency formater
         * convert the currency in to comma seperated string
         */
        currencyStyleConverter : function(amount)
        {
            var finalString = [];
            var amountLength = amount.toString().length;
            if(!amountLength > 0 )//no amount found or no need to mask
            {
                return 0;
            }
            else if(amountLength < 4)
            {
                return amount;
            }
            /* convert the digits in to individual array element */
            var tempArr = amount.toString().split('');
            /* reverse the array element */
            var limit = amountLength - 1;
            var i = 1;
            while(limit >= 0)
            {
                finalString.push(tempArr[limit]);
                if(i%3 == 0)
                {
                    finalString.push(',');
                }
                limit --;
                i++;
            }

            var strArr = finalString.reverse();
            if(amountLength % 3 == 0)
            {
                return strArr.join('').substr(1);
            }

           return strArr.join('');
        }

    };
}]);
