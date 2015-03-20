/**
 * Sales Controller
 * Depends Upon BusinessManager Controller
 */
angular.module('ezeidApp')
    .controller('SalesCtrl',['$scope','$rootScope','$http','GURL','MsgDelay','$interval','$q','$timeout',function($scope,$rootScope,$http,GURL,MsgDelay,$interval,$q,$timeout){

        /**
         * For showing loading Icon
         * IF all values becomes true then only grid will appear else loading will be stopped and error message is shown
         * @type {{itemsLoaded: boolean, statusLoaded: boolean, nextActionsLoaded: boolean, foldersLoaded: boolean, transactionsLoaded: boolean}}
         */
        $scope.readyState = {
            itemsLoaded : false,
            statusLoaded : false,
            nextActionsLoaded : false,
            foldersLoaded : false,
            transactionsLoaded : false
        };

        /**
         * IF data is not loaded successfully, there might be server API error or connection
         * error in sending API Calls
         * @type {boolean}
         */
        $scope.serverApiError = false;


        /**
         * Status List (eg. Accepted, In Progress, In Delivery)
         * @type {Array}
         */
        $scope.enquiryStatusList = [];

        /**
         * Next Action List (eg. Call, Meet, Followup)
         * @type {Array}
         */
        $scope.nextActionList = [];

        /**
         * Items List for Sales
         * @type {Array}
         */
        $scope.itemList = [];

        /**
         * Folder List (Sales Rules)
         * @type {Array}
         */
        $scope.folderList = [];


        $scope.transactionList = [];

        /**
         *     Open Modal box for user
         */
        $scope.showModal = false;
        $scope.toggleModalBox = function(){
            $scope.showModal = !$scope.showModal;
        };

        $scope.modalBox = {
            title : 'Transaction Details'
        };

        /****************************************************** Controller Code *****************************/

        /**
         * View Transaction Details
         */
        $scope.viewDetails = function(){
            $scope.toggleModalBox();
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
            exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location"))
            //Options for exporting data ends
        };


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
                cellTemplate:'<div class="row"><div class="col-lg-12 text-center" style="margin-top:5px;"><button class="btn btn-xs btn-info no-radius ng-scope" ng-click="grid.appScope.saveTransaction()">Save</button></div></div>'
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
                cellTemplate:'<div class="row"><div class="col-lg-12 text-center" style="margin-top:5px;"><button class="btn btn-xs btn-info no-radius ng-scope" ng-click="grid.appScope.viewDetails()">Details</button></div></div>'
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
                editDropdownOptionsArray: $scope.enquiryStatusList,
                enableFiltering: false
            },
            {
                width : '10%',
                name: 'nextAction',
                displayName: 'Next Action',
                editableCellTemplate: 'ui-grid/dropdownEditor',
                editDropdownValueLabel: 'nextAction',
                editDropdownOptionsArray: $scope.nextActionList,
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
                editDropdownOptionsArray : $scope.folderList,
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
////                if( colDef.name === 'gender' ){
////                    if( newValue === 1 ){
////                        rowEntity.sizeOptions = $scope.maleSizeDropdownOptions;
////                    } else {
////                        rowEntity.sizeOptions = $scope.femaleSizeDropdownOptions;
////                    }
////                }
//                alert('row edited');
////                console.log(gridApi.rowEdit.getDirtyRows());
//                console.log(gridApi);
//
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


        $scope.savePromises = {};

        /**
         * Changing row contents will make this function call
         * From API (Copied from original source)
         * @param rowEntity
         */
        $scope.saveRow = function( rowEntity ) {
            // create a fake promise - normally you'd use the promise returned by $http or $resource
//            var promise = $q.defer();
//            console.log(rowEntity);
//            $scope.gridApi.rowEdit.setSavePromise( rowEntity, promise.promise );


            console.log(rowEntity.trnId);
            $scope.savePromises[rowEntity.trnId] = $q.defer();
            $scope.gridApi.rowEdit.setSavePromise( rowEntity, $scope.savePromises[rowEntity.trnId].promise );

//            // fake a delay of 3 seconds whilst the save occurs, return error if gender is "male"
//            $interval( function() {
//
//                promise.resolve();
//            }, 3000, 1);
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
                url : GURL + 'ewtGetItemList',
                method : 'GET',
                params : {
                    Token : $rootScope._userInfo.Token,
                    FunctionType : 0,
                    MasterID : $rootScope._userInfo.MasterID
                }
            }).success(function(resp){
                console.log(resp);
                    if(resp && resp.length > 0){
                        $scope.itemList = resp;
                    }
                    $scope.readyState.itemsLoaded = true;
                }).error(function(err){
                console.log(err);
            });
        };

        /**
         * Load all available status for transactions
         */
        $scope.loadAllStatus = function(){
            $http({
                url : GURL + 'ewtGetStatusType',
                method : 'GET',
                params : {
                    Token : $rootScope._userInfo.Token,
                    FunctionType : 0,
                    MasterID : $rootScope._userInfo.MasterID
                }
            }).success(function(resp){
                    if(resp && resp.length > 1 && resp !== "null"){
                        for(var i = 0; i < resp.length; i++){
                            $scope.enquiryStatusList.push({
                                id : resp[i].TID,
                                status : resp[i].StatusTitle
                            });
                        }
                        $scope.readyState.statusLoaded = true;
                    }
            }).error(function(err){
                console.log(err);
            });
        };

        /**
         * Load All next actions available
         */
        $scope.loadAllNextActions = function(){
            $http({
                url : GURL + 'ewtGetActionType',
                method : 'GET',
                params : {
                    Token : $rootScope._userInfo.Token,
                    FunctionType : 0,
                    MasterID : $rootScope._userInfo.MasterID
                }
            }).success(function(resp){
                console.log(resp);
                    if(resp && resp.length > 0 && resp !== "null"){
                        for(var i = 0; i < resp.length; i++){
                            $scope.nextActionList.push({
                                id : resp[i].TID,
                                nextAction : resp[i].ActionTitle
                            });
                        }
                        $scope.readyState.nextActionsLoaded = true;
                    }
            }).error(function(err){
                console.log(err);
            });
        };

        /**
         * Load all folder lists
         */
        $scope.loadAllFolders = function(){
            $http({
                url : GURL + 'ewtGetFolderList',
                method : 'GET',
                params : {
                    Token : $rootScope._userInfo.Token,
                    FunctionType : 0,
                    MasterID : $rootScope._userInfo.MasterID
                }
            }).success(function(resp){
                console.log(resp);
                    if(resp && resp.length > 0 && resp !== "null"){
                        for(var i = 0; i < resp.length; i++){
                            $scope.folderList.push({
                                id : resp[i].TID,
                                folder : resp[i].FolderTitle
                            });
                        }
                        $scope.readyState.foldersLoaded = true;
                    }
            }).error(function(err){
                console.log(err);
            });
        };

        /**
         * Load all transactions
         */
        $scope.loadAllTransactions = function(){
            $http({
                url : GURL + 'ewtGetTranscation',
                method : "GET",
                params : {
                    Token : $rootScope._userInfo.Token,
                    FunctionType : 0
                }
            }).success(function(resp){
                    console.log(resp);
                    if(resp && resp.length > 0 && resp !== "null"){
                        for(var i = 0; i < resp.length; i++){
                            /**
                             * @todo Convert data to grid based format (JSON Format that is accepted by grid)

                            $scope.transactionList.push({
                                trnId : resp[i].TID,
                                folder : resp[i].FolderTitle
                            });
                             */
                        }

                    }
                    $scope.readyState.transactionsLoaded = true;
            }).error(function(err){

            });
        };

        /**
         * Try to reload all server data again
         *
         */

        $scope.reloadAgain = function(){
            $scope.readyState = {
                itemsLoaded : false,
                statusLoaded : false,
                nextActionsLoaded : false,
                foldersLoaded : false,
                transactionsLoaded : false
            };
            $scope.serverApiError = false;
            $scope.loadAllItems();
            $scope.loadAllFolders();
            $scope.loadAllStatus();
            $scope.loadAllNextActions();
            $scope.loadAllTransactions();
            $timeout(function(){
                if(!($scope.readyState.itemsLoaded && $scope.readyState.statusLoaded && $scope.readyState.nextActionsLoaded
                    && $scope.readyState.foldersLoaded && $scope.readyState.transactionsLoaded)){
                    $scope.serverApiError = true;
                }
            },15000);
        };

        /**
         * Loading Data
         */
        $scope.loadAllItems();
        $scope.loadAllFolders();
        $scope.loadAllStatus();
        $scope.loadAllNextActions();
        $scope.loadAllTransactions();

        /**
         * Checks that if the data is not loaded in 10s show the error message
         */
        $timeout(function(){
            if(!($scope.readyState.itemsLoaded && $scope.readyState.statusLoaded && $scope.readyState.nextActionsLoaded
                && $scope.readyState.foldersLoaded && $scope.readyState.transactionsLoaded)){
                $scope.serverApiError = true;
            }
        },10000);




}]);