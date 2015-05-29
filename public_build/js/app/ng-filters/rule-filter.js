/**
 * Filter for grouping Business Rules Based upon thier functions(types: Sales, Reservation,HomeDelivery,Service, Resume)
 * Usage (ruleList | ruleFilter:2)
 */
angular.module('ezeidApp').filter('ruleFilter',function(){
    return function(rules,ruleType){
        var filteredRules = [];
        rules.forEach(function(rule,index){
            for(var prop in rule){
                if(rule.hasOwnProperty(prop) && (prop == 'RuleFunction') && (rule.RuleFunction === ruleType)){
                    filteredRules.push(rule);
                }
            }
        });

        return filteredRules;
    };
});

