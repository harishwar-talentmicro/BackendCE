
angular.module('ezeidApp').controller('TabController',['$scope',function($scope){
    /**
     * Default Tab selected
     */
    var urlQuery = null;
    if(urlQuery)
    {
        $scope.selectedTab = "maps";
        console.log("SAi6");
    }
    else{
        $scope.selectedTab = "";
    }

    /**
     * Selects a particular tab
     */
    $scope.selectTab = function(tab){
        console.log("SAi5");
        $scope.selectedTab = tab;
        console.log('from tabcontroller');
        console.log($scope.selectedTab);
    };
}]);