angular.module('ezeidApp').controller('LocationDeleteConfirmCtrl',[
    '$scope',
    '$modalInstance',
    'items',
    function (
        $scope, $modalInstance, items
    ) {

        $scope.ok = function () {
            $modalInstance.close(true);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);