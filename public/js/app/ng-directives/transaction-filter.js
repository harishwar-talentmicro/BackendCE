(function(){
    angular.module('ezeidApp').directive('transactionFilter',['$compile',function($compile){
        var template = '<button class="btn btn-sm btn-warning no-radius" data-toggle="popover" '+
        'title=\'<h4 class="font-open-sans-light">Filter by'+
        '   <span class="pull-right glyphicon glyphicon-remove popover-close tiny"></span>'+
        '   </h4>\''+
        'data-content=\''+
        '   <label class="font-open-sans-light text-info">Status Type</label>'+
        '<div class="form-group form-group-sm"> {{filterList}}'+
        '    <select class="form-control" ng-model="filterType">'+
        '    <option ng-repeat="filterStatus in filterList track by count" ng-init="count = $index" value="{{filterList[count].TID}}">{{filterList[count].StatusTitle}}</option>'+
        '    </select>'+
        '    </div>'+

        //'   <label class="font-open-sans-light text-info">Action Type</label>'+
        //'<div class="form-group  form-group-sm">'+
        //'    <select class="form-control">'+
        //'    <option value="">All</option>'+
        //'    <option value="">New</option>'+
        //'    <option value="">Accepted</option>'+
        //'    </select>'+
        //'    </div>'+
        '    \''+
        '    >'+
        '    <span class="glyphicon glyphicon-filter"></span> Filters'+
        '    </button>';

        var linker = function(scope,element,attrs){
            //console.log(template);
            scope.count = 0;
            element.html(template).show();
            $compile(element.contents())(scope);
        };

        return {
            restrict : "E",
            replace : true,
            //require : '^ngModel',
            link: linker,
            scope: {
                filterList : '=',
                filterType :'='
            }
        };

    }]);
})();