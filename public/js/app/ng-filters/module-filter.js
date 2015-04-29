/**
 * Arranges the module in the order of permission
 */
(function(){
    angular.module('ezeidApp').filter('moduleFilter',function(){
        return function(modules){
            var orderedModules = [];
            var disabledModules = [];
            modules.forEach(function(module,index){
                if(parseInt(modules[index]['permission']) !== 0){
                    orderedModules.push(module);
                }
                else{
                    disabledModules.push(module);
                }
            });

            return orderedModules.concat(disabledModules);
        };
    });
})();