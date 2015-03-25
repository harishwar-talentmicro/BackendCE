/**
 * Sales Controller
 * Depends Upon BusinessManager Controller
 */
angular.module('ezeidApp')
    .controller('SalesCtrl',['$scope','$rootScope','$http','GURL','MsgDelay','$interval','$q','$timeout',function($scope,$rootScope,$http,GURL,MsgDelay,$interval,$q,$timeout){

        /**
         * Business Filters Need the all rules, status and folders
         * Therefore to load all of these froms server everytime is not a good idea
         * So we are putting them in rootScope and filters can directly access it from here based
         * on its FunctionType
         * @type {{}}
         */
        $rootScope.businessManager = {
            sales : {
                folders : {},
                enquiryStatus : {},
                nextActions : {}
            },
            reservation : {
                folders : {},
                enquiryStatus : {},
                nextActions : {}
            },
            homeDelivery : {
                folders : {},
                enquiryStatus : {},
                nextActions : {}
            },
            service : {
                folders : {},
                enquiryStatus : {},
                nextActions : {}
            },
            resume : {
                folders : {},
                enquiryStatus : {},
                nextActions : {}
            }
        };
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

        /**
         * Modal Box dynamic templates path
         * @type {string}
         */
        var templatesPath = 'html/business-manager/templates/';

        /**
         * Available Modal Templates (based on ItemList Type)
         * @type {Array}
         */
        $scope.modalTemplates = [
            'modal-msg-only.tpl.html',
            'modal-item-only.tpl.html',
            'modal-item-picture.tpl.html',
            'modal-item-picture-qty.tpl.html',
            'modal-item-picture-qty-rate.tpl.html'
        ];

        /**
         * ModalBox DataModel
         * @type {{title: string, template: string, transaction : Object}}
         */
        $scope.modalBox = {
            title : 'Transaction Details',
            template : templatesPath + $scope.modalTemplates[$scope.modules[$scope.selectedModule].listType],
            transaction : {}
        };

        /**
         * View Transaction Details
         * Opens Modal Box
         */
        $scope.viewDetails = function(rowEntity){
            console.log(rowEntity);
            $scope.modalBox.data = rowEntity;
            $scope.toggleModalBox();
            console.log($scope.modalBox);
        };

        /****************************************************** Controller Code *****************************/

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

            // Never allow saving of dirty rows automatically by setting this option to -1
            rowEditWaitInterval: -1,

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
                cellTemplate:'<div class="row"><div class="col-lg-12 text-center" style="margin-top:5px;"><button class="btn btn-xs btn-info no-radius ng-scope" ng-click="grid.appScope.saveTransaction(row.entity,row)">Save</button></div></div>'
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
                enableFiltering: false,
                enableCellEditOnFocus : true
            },
            {
                enableSorting: false,
                width : '6%',
                name : 'detailBtn',
                displayName : ' ',
                enableCellEditOnFocus:false,
                enableCellEdit : false,
                enableFiltering : false,
                cellTemplate:'<div class="row"><div class="col-lg-12 text-center" style="margin-top:5px;"><button class="btn btn-xs btn-info no-radius ng-scope" ng-click="grid.appScope.viewDetails(row.entity)">Details</button></div></div>'
            },
            {
                width : '15%',
                name: 'ezeid',
                displayName : 'EZEID',
                enableFiltering: true,
                enableCellEditOnFocus : true
            },
            {
                width : '20%',
                name: 'contactInfo',
                displayName : 'Contact Info',
                enableFiltering: true,
                enableCellEditOnFocus : true
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
                enableFiltering: false,
                cellFilter : 'mapEnquiryStatus:0'
            },
            {
                width : '10%',
                name: 'nextAction',
                displayName: 'Next Action',
                editableCellTemplate: 'ui-grid/dropdownEditor',
                editDropdownValueLabel: 'nextAction',
                editDropdownOptionsArray: $scope.nextActionList,
                enableFiltering: true,
                cellFilter : 'mapNextAction:0'
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
                enableFiltering: true,
                cellFilter : 'mapFolder:0'
            },
            {
                width : '20%',
                name : 'notes',
                displayName : 'Notes',
                enableFiltering: false,
                enableCellEditOnFocus : true
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
            $scope.gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef){
//                console.log(rowEntity);
//                console.log(colDef);
//                console.log(gridApi);

                console.log('I am from afterCellEdit');
            });


            $scope.gridApi.edit.on.beginCellEdit($scope,function(rowEntity,colDef){
                console.log('I am from beginEditCell');
                console.log(rowEntity); console.log(colDef);

            });

            $scope.gridApi.edit.on.cancelCellEdit($scope,function(rowEntity){
                console.log('I am from cancelCellEdit');
            });

//            $scope.gridOptions.$on('ngGridEventStartCellEdit',function(){
//                console.log('ngGridEventStartCellEdit');
//            });

//            $scope.gridApi.edit.on.beginEditCell($scope,function(rowEntity,colDef){
//                $scope.isSaveBoxVisible = true;
//            });

//            gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
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
            console.log($scope.gridOptions.data);
            var n = $scope.gridOptions.data.length + 1;
            console.log($scope.gridApi.grid.rows);
            var newRow = {

                trnId : '',
                particulars : "Enter particulars here",
                ezeid : '',
                contactInfo : ''+'',
                amount : 0,
                status : 1,
                nextAction : 2,
                nextActionDate : 'Sept 30,14 14:00',
                folder : 2,
                notes : "Notes here ",
                updatedOn : "",
                updatedBy : "",
                items : [],
                savedOnServer : false
            };
            $scope.gridOptions.data.unshift(newRow);
            var dirtyRows = [newRow];
            $interval( function() {
                $scope.gridApi.rowEdit.setRowsDirty(dirtyRows);
            }, 0, 1);
//            console.log($scope.gridApi.grid.rows);
            console.log($scope.gridOptions.data);
        };

        /**
         * Remove added rows
         */
        $scope.removeFirstRow = function(){
            /**
             * @todo Add condition to check if this is newly created data or old one
             */
            console.log($scope.gridOptions.data);
            $scope.gridOptions.data.splice(0,1);
//            $scope.gridOpts.data.splice(0,1);
        };



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
        $scope.saveTransaction = function(rowEntity,GridRow){
            console.log(rowEntity);
            console.log(GridRow);
            console.log('Save is clicked');
            // Get Dirty rows by calling the line below
//            console.log($scope.gridApi.rowEdit.getDirtyRows());
        };

        /******************************************* Grid Code Ends here **********************************/



        /**
         * Finds an item from ItemList based on TID
         */
        $scope.findItemByTid = function(searchTid){

            var result = null;
            if($scope.itemList.length < 1 || searchTid == 0 || searchTid == null || typeof(searchTid) == "undefined" ){
                return result;
            }
            for(var i = 0; i < $scope.itemList.length; i++){
                if($scope.itemList[i].TID == searchTid){
                    var result = $scope.itemList[i];
                    break;
                }
            }
            return result;
        };

        /**
         * Finds an object from array based on it's property
         */
        $scope.findItemByProperty = function(searchProperty, searchPropertyValue, searchArray){
            var result = -1;
            if(searchArray.length < 1 || (!searchPropertyValue) ){
                return result;
            }
            for(var i = 0; i < searchArray.length; i++){
                if(searchArray[i].hasOwnProperty(searchProperty)){
                    if(searchArray[i][searchProperty] == searchPropertyValue){
                        result = i;
                        break;
                    }
                }
            }
            return result;
        };


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
         * @returns {promise|*}
         */
        $scope.loadAllStatus = function(){
            var deferred = $q.defer();
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
                            $rootScope.businessManager.sales.enquiryStatus[resp[i].TID] = resp[i].StatusTitle;
                        }
                        $scope.readyState.statusLoaded = true;
                        deferred.resolve(true);
                    }
                    else{
                        deferred.resolve(false);
                    }
            }).error(function(err){
                console.log(err);
                    deferred.resolve(false);
            });
            return deferred.promise;
        };


        /**
         * Load All next actions available
         * @returns {promise|*}
         */
        $scope.loadAllNextActions = function(){
            var deferred = $q.defer();
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
                            $rootScope.businessManager.sales.nextActions[resp[i].TID] = resp[i].ActionTitle;
                        }
                        deferred.resolve(true);
                        $scope.readyState.nextActionsLoaded = true;
                    }
                    else{
                        deferred.resolve(false);
                    }
            }).error(function(err){
                console.log(err);
                    deferred.resolve(false);
            });
            return deferred.promise;
        };

        /**
         * Load all folder lists
         * @returns {promise|*}
         */
        $scope.loadAllFolders = function(){
            var deferred = $q.defer();
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
                            $rootScope.businessManager.sales.folders[resp[i].TID] = resp[i].FolderTitle;
                        }
                        $scope.readyState.foldersLoaded = true;
                        deferred.resolve(true);
                    }
                    else{
                        deferred.resolve(false);
                    }
            }).error(function(err){
                console.log(err);
                deferred.resolve(false);
            });
            return deferred.promise;
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
                    var gridData = [];
                    console.log(resp);
                    if(resp && resp.length > 0 && resp !== "null"){
                        for(var i = 0; i < resp.length; i++){
                            var transaction = {
                                trnId : resp[i].TrnNo,
                                TID : resp[i].TID,          // Message ID to be sent while loading respective items
                                particulars : resp[i].Message,
                                ezeid : (resp[i].Requester == "null" || resp[i].Requester == null) ? "" :  resp[i].Requester,
                                contactInfo : resp[i].ContactInfo,
                                amount : resp[i].Amount,
                                status : resp[i].Status,
                                nextAction : resp[i].NextActionID,
                                nextActionDate : resp[i].NextActionDate,
                                folder : resp[i].FolderRuleID,
                                notes : resp[i].Notes,
                                updatedBy : (resp[i].UpdatedUser.length > 0) ? resp[i].UpdatedUser : '',
                                updatedOn : (resp[i].updatedDate.length > 0) ? resp[i].updatedDate : '',
                                // This value will tell that the transaction can be removed from grid or not
                                // If value is true transactions cannot be removed(deleted from grid)
                                savedOnServer : true,
                                items : []
                            };

                            /**
                             * @todo
                             * 1. Bind Item data when opening details(modalBox)
                             * 2. Add Items to Transaction
                             * 3. Save Transaction
                             * 4. Update Transaction
                             * 5. Change Numeric Values of Status and Action to Human Readable Titles //Done
                             * 6. Load Dynamic Templates for ModalBox based on ItemListType
                             * 7. Load Dynamic GridOptions based on Permissions Type
                             */

                            gridData.push(transaction);
                        }
                        $scope.gridOptions.data = gridData;
                        console.log('GridRow...................................');
                        console.log($scope.gridApi.grid);
                        console.log($scope.gridApi.grid.rows);
                        console.log('GridRow...................................ends');
                        console.log($scope.gridOptions.data);
                    }
                    $scope.readyState.transactionsLoaded = true;
            }).error(function(err){

            });
        };

        /**
         * Progressive Loading of StatusList, Folders,NextActions and then Items and Transactions at last
         */
        $scope.loadProgressive = function(){
            $scope.loadAllItems();
            $scope.loadAllFolders().then(function(fLoadStatus){
                $scope.loadAllStatus().then(function(sLoadStatus){
                    $scope.loadAllNextActions().then(function(nALoadStatus){
                        $scope.loadAllTransactions();
                    });
                });
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
            $scope.loadProgressive();
            $timeout(function(){
                if(!($scope.readyState.itemsLoaded && $scope.readyState.statusLoaded && $scope.readyState.nextActionsLoaded
                    && $scope.readyState.foldersLoaded && $scope.readyState.transactionsLoaded)){
                    $scope.serverApiError = true;
                }
            },15000);
        };

        /**
         * Loading Data in progressive manner
         */
        $scope.loadProgressive();

        /**
         * Checks that if the data is not loaded in 15 sec show the error message
         */
        $timeout(function(){
            if(!($scope.readyState.itemsLoaded && $scope.readyState.statusLoaded && $scope.readyState.nextActionsLoaded
                && $scope.readyState.foldersLoaded && $scope.readyState.transactionsLoaded)){
                $scope.serverApiError = true;
            }
        },15000);




}]);