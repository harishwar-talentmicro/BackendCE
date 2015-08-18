/**
 * Pass date and get no. of day diff. between current date and passed date
 */
(function(){
    angular.module('ezeidApp').filter('ageFilter', function() {

        function calculateAge(birthday) {
            // birthday is a date

            return moment(birthday, "DD-MMM-YYYY hh:mm A").fromNow();
           /* return moment("birthday", "DD-MMM-YYYY hh:mm A").fromNow().split(" ")[0];*/
        }

        return function(birthdate) {
            return calculateAge(birthdate);
        };
    });
})();

