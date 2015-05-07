/**
 * Filter for grouping Business Rules Based upon thier functions(types: Sales, Reservation,HomeDelivery,Service, Resume)
 * Usage (ruleList | ruleFilter:2)
 */
(function(){
    angular.module('ezeidApp').filter('dateTimeFilter',function(){
        return function(time,pFormat,rFormat){
            if(!time){
                return '';
            }
            if(!pFormat){
                pFormat = "DD MMM YYYY hh:mm A";
            }
            if(!pFormat){
                rFormat = "DD MMM YYYY hh:mm A";
            }
            var fTime = '';
            try{
                var m = moment(time,pFormat);
                fTime = m.format(rFormat);
            }
            catch(ex){
                console.error('Invalid Time');
            }
            return fTime;
        };
    });
})();


