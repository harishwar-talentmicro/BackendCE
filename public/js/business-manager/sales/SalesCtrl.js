angular.module('ezeidApp')
    .controller('SalesCtrl',['$scope','$rootScope','$http','GURL','MsgDelay','$interval','$q',function($scope,$rootScope,$http,GURL,MsgDelay,$interval,$q){




        /****************************************************** Controller Code *****************************/

        $scope.showMe = function(){
            console.log('Clicked');
        };

        /**
         * Basic Grid Options
         * @type {{enableRowSelection: boolean, paginationPageSizes: Array, paginationPageSize: number, enableFiltering: boolean, enableCellEditOnFocus: boolean}}
         */
        $scope.gridOptions = {
            enableRowSelection: true,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,
            // For enabling search filter
            enableFiltering: true,
            enableCellEditOnFocus : true,

            //Options for Exporting Data as PDF
            enableGridMenu: true,
            enableSelectAll: true,
            exporterCsvFilename: 'myFile.csv',
            exporterPdfDefaultStyle: {fontSize: 9},
            exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
            exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
            exporterPdfHeader: { text: "My Header", style: 'headerStyle' },
            exporterPdfFooter: function ( currentPage, pageCount ) {
                return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
            },
            exporterPdfCustomFormatter: function ( docDefinition ) {
                docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
                docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
                return docDefinition;
            },
            exporterPdfOrientation: 'landscape',
            exporterPdfPageSize: 'LETTER',
            exporterPdfMaxGridWidth: 500,
            exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
            //Options for exporting data ends
        }




        /**
         * Grid Options Column Definitions
         * @todo To be loaded based on user permission and functionType
         * @type {Array}
         */
        $scope.gridOptions.columnDefs = [
            {
                enableSorting: false,
                width : '5%',
                name : 'saveBtn',
                displayName : '',
                enableFiltering : false,
                enableCellEditOnFocus:false,
                enableCellEdit : false,
                cellTemplate:'<div class="row"><div class="col-lg-12 text-center" style="margin-top:5px;"><button class="btn btn-xs btn-info no-radius ng-scope" ng-click="grid.appScope.showMe()">Save</button></div></div>'
            },
            {
                width : '7%',
                name: 'trnId',
                enableCellEditOnFocus:false,
                enableCellEdit : false,
                displayName : 'Trn. No.' ,
                enableFiltering: false
            },
            {
                width : '20%',
                name: 'particulars',
                displayName : 'Particulars',
                enableFiltering: false
            },
            {
                enableSorting: false,
                width : '6%',
                name : 'detailBtn',
                displayName : ' ',
                enableCellEditOnFocus:false,
                enableCellEdit : false,
                enableFiltering : false,
                cellTemplate:'<div class="row"><div class="col-lg-12 text-center" style="margin-top:5px;"><button class="btn btn-xs btn-info no-radius ng-scope" ng-click="grid.appScope.showMe()">Details</button></div></div>'
            },
            {
                width : '15%',
                name: 'ezeid',
                displayName : 'EZEID',
                enableFiltering: true
            },
            {
                width : '20%',
                name: 'contactInfo',
                displayName : 'Contact Info',
                enableFiltering: true
            },
            {
                width : '10%',
                name: 'amount',
                displayName : 'Total Amount',
                enableFiltering: true
            },
            {
                width : '10%',
                name: 'status',
                displayName: 'Status',
                editableCellTemplate: 'ui-grid/dropdownEditor',
                editDropdownValueLabel: 'status',
                editDropdownOptionsArray: [
                    {
                        status : 'Started',
                        id : 1

                    },
                    {
                        status : 'In progress',
                        id : 2

                    }
                ],
                enableFiltering: false
            },
            {
                width : '10%',
                name: 'nextAction',
                displayName: 'Next Action',
                editableCellTemplate: 'ui-grid/dropdownEditor',
                editDropdownValueLabel: 'nextAction',
                editDropdownOptionsArray: [
                    {
                        id : 1,
                        nextAction : 'Call'
                    },
                    {
                        id : 2,
                        nextAction : 'Followup'
                    }
                ],
                enableFiltering: true
            },
            {
                width : '15%',
                name : 'nextActionDate',
                displayName : 'Next Action Date',
                enableFiltering: false
            },
            {
                width : '10%',
                name : 'folder',
                displayName : 'Folder',
                editableCellTemplate : 'ui-grid/dropdownEditor',
                editDropdownValueLabel : 'folder',
                editDropdownOptionsArray : [
                    {
                        id : 1,
                        folder : 'Jayanagar'
                    },
                    {
                        id : 2,
                        folder : 'JP nagar'
                    }
                ],
                enableFiltering: true
            },
            {
                width : '20%',
                name : 'notes',
                displayName : 'Notes',
                enableFiltering: false
            },
            {
                width : '15%',
                name: 'updatedBy',
                displayName : 'Updated By',
                enableCellEditOnFocus:false,
                enableCellEdit : false,
                enableFiltering: true
            },
            {
                width : '15%',
                name: 'updatedOn',
                enableCellEditOnFocus:false,
                enableCellEdit : false,
                displayName : 'Updated On',
                enableFiltering: true
            }
        ];

        $scope.gridOptions.data = [
            {
                trnId : 1,
                particulars : "This is particulars",
                ezeid : 'HIRECRAFT.SKS',
                contactInfo : 'Abc Customer, 7867627342',
                amount : 5000,
                status : 1,
                nextAction : 2,
                nextActionDate : 'Sept 30,14 14:00',
                folder : 2,
                notes : "This is notes",
                updatedOn : "Sept 24,14 11:00 ",
                updatedBy : "Shailesh"
            }
        ];

        $scope.gridOptions.onRegisterApi = function(gridApi){
            $scope.gridApi = gridApi;
            gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
//            gridApi.core.on.notifyDataChange($scope,function(type){
//                console.log(type);
//                console.log('Data changed');
//            });
            /**
             * Uncomment code below for afterCellEdit functionality
             */
//            gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
//                if( colDef.name === 'gender' ){
//                    if( newValue === 1 ){
//                        rowEntity.sizeOptions = $scope.maleSizeDropdownOptions;
//                    } else {
//                        rowEntity.sizeOptions = $scope.femaleSizeDropdownOptions;
//                    }
//                }
//            });
        };
        ///////////////////////////////////////////////////////////////////////////////////////

        /**
         * Adds a new row at first in the transaction table
         */
        $scope.addNewRow = function() {
            var n = $scope.gridOptions.data.length + 1;
            $scope.gridOptions.data.unshift({

                trnId : 1+n,
                particulars : "This is particulars "+n,
                ezeid : 'HIRECRAFT.AB'+n,
                contactInfo : 'Abc Customer ' +n +', 7867627342',
                amount : 5000,
                status : 1,
                nextAction : 2,
                nextActionDate : 'Sept 30,14 14:00',
                folder : 2,
                notes : "This is notes "+n,
                updatedOn : "Sept 24,14 11:00 ",
                updatedBy : "User "+n

            });
        };

        /**
         * Remove added rows
         */
        $scope.removeFirstRow = function(){
            /**
             * @todo Add condition to check if this is newly created data or old one
             */
            $scope.gridOpts.data.splice(0,1);
        };

        /**
         * Changing row contents will make this function call
         * From API (Copied from original source)
         * @param rowEntity
         */
        $scope.saveRow = function( rowEntity ) {
            // create a fake promise - normally you'd use the promise returned by $http or $resource
            var promise = $q.defer();
            $scope.gridApi.rowEdit.setSavePromise( rowEntity, promise.promise );

            // fake a delay of 3 seconds whilst the save occurs, return error if gender is "male"
            $interval( function() {

//                if (rowEntity.gender === 'male' ){
//                    promise.reject();
//                } else {
//                    promise.resolve();
//                }

                promise.resolve();
            }, 3000, 1);
        };



        /**
         * Save transaction function
         * @author Indrajeet
         */
        $scope.saveTransaction = function(){
            console.log('Save is clicked');
        };

        /******************************************* Grid Code Ends here **********************************/


        /**
         * Load all the items based on function Type
         */
        $scope.loadAllItems = function(){
            $http({
                url : GURL + '',
                method : 'GET',
                params : {
                    Token : $rootScope._userInfo.Token,
                    FunctionType : 0
                }
            }).success(function(resp){
                console.log(resp);
            }).error(function(err){
                console.log(err);
            });
        };

        /**
         * Load all available status for transactions
         */
        $scope.loadAllStatus = function(){
            $http({
                url : GURL + '',
                method : 'GET',
                params : {
                    Token : $rootScope._userInfo.Token
                }
            }).success(function(resp){
                console.log(resp);
            }).error(function(err){
                console.log(err);
            });
        };

        /**
         * Load All next actions available
         */
        $scope.loadAllNextActions = function(){
            $http({
                url : GURL + '',
                method : 'GET',
                params : {
                    Token : $rootScope._userInfo.Token
                }
            }).success(function(resp){
                console.log(resp);
            }).error(function(err){
                console.log(err);
            });
        };

        /**
         * Load all folder lists
         */
        $scope.loadAllFolders = function(){
            $http({
                url : GURL + '',
                method : 'GET',
                params : {
                    Token : $rootScope._userInfo.Token
                }
            }).success(function(resp){
                console.log(resp);
            }).error(function(err){
                console.log(err);
            });
        };

}]);