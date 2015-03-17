angular.module('ezeidApp')
    .controller('SalesCtrl',['$scope','$rootScope','$http','GURL','MsgDelay',function($scope,$rootScope,$http,GURL,MsgDelay){


        $scope.gridOptions = {
            expandableRowTemplate: 'html/business-manager/expandableRowTemplate.html',
            expandableRowHeight: 150,
            //subGridVariable will be available in subGrid scope
            enableRowSelection: true,
            expandableRowScope: {
                subGridVariable: 'subGridScopeVariable'
            },
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25
        }

        $scope.gridOptions.columnDefs = [
            { name: 'id' },
            { name: 'name'},
            { name: 'age'},
            { name: 'address.city'}
        ];

        $http.get('http://ui-grid.info/data/500_complex.json')
            .success(function(data) {
                for(i = 0; i < data.length; i++){
                    data[i].subGridOptions = {
                        columnDefs: [ {name:"Id", field:"id"},{name:"Name", field:"name"} ],
                        data: data[i].friends
                    }
                }
                $scope.gridOptions.data = data;
            });

        $scope.gridOptions.onRegisterApi = function(gridApi){
            $scope.gridApi = gridApi;
        };

        $scope.expandAllRows = function() {
            $scope.gridApi.expandable.expandAllRows();
        }

        $scope.collapseAllRows = function() {
            $scope.gridApi.expandable.collapseAllRows();
        }

}]);