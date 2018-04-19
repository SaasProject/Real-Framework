/*
    Name: Warehouse Controller
    Date Created: 02/06/2018
    Author(s): Ayala, Jenny
               Flamiano, Glenn  
*/

(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('Warehouse.IndexController', Controller)

        /*
            Function name: Object filter
            Author(s): Flamiano, Glenn
            Date Modified:
            Description: to order the rows of the table
            Parameter(s): none
            Return: Array
        */
        .filter('orderObjectBy', function() {
          return function(items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function(item) {
              filtered.push(item);
            });
            filtered.sort(function (a, b) {
              return (a[field] > b[field] ? 1 : -1);
            });
            if(reverse) filtered.reverse();
            return filtered;
          };
        })

        /*
            Function name: Pagination filter
            Author(s): Flamiano, Glenn
            Date Modified:
            Description: to slice table per page based on number of items
            Parameter(s): none
            Return: Array
        */
        .filter('pagination', function(){
            return function(data, start){
                //data is an array. slice is removing all items past the start point
                return data.slice(start);
            };
        });
 
    function Controller($scope, FlashService, ModulesService, TableService, socket, $rootScope, InputTypeService, InputValidationService) {
        var vm = this;
		
		// Scope for data
        $scope.warehouses = [];
		$scope.whouse = {};
		
        $scope.formValid = true;
        $scope.unEditAble = false;
		$scope.loading = true;
		$scope.viewModal = false;
        $scope.confirmPassword = {};

        /*
            Function name: Calculate Object size
            Author(s): Flamiano, Glenn
            Date Modified:
            Description: to compute the size of an object
            Parameter(s): none
            Return: size
        */
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };
      

        /*
            Function name: Reset Flash Messages
            Author(s): Flamiano, Glenn
            Date Modified: February 2018
            Description: Hide flash messages of every modal
            Parameter(s): none
            Return: none
        */
        function resetModalFlash(){
            $scope.showMainFlash = true;
            $scope.showAddFlash = false;
            $scope.showEditFlash = false;
        }
        resetModalFlash();

		
   /***** Table functions *****/
		
		// initialize table page
        $scope.currentPage = 1;
        $scope.pageSize = 10;
        
        // column to sort, default is warehouse name
        $scope.column = 'name';

        // sort ordering(Ascending/Descending). Set true for descending
        $scope.reverse = false; 

        /*
            Function name: Sort Table Columns
            Author(s): Flamiano, Glenn
            Date Modified: December 2018
            Description: To sort the table by ascending/desending order by clicking the column header
            Parameter(s): column
            Return: none
        */
        $scope.sortColumn = function(col){
            $scope.column = col;
            $scope.reverse = TableService.sortSelectedColumn($scope.reverse, col).result;
        };

        /*
            Function name: Sort Class
            Author(s): Flamiano, Glenn
            Date Modified: December 2018
            Description: To change column sort arrow UI when user clicks the column
            Parameter(s): column
            Return: none
        */
        $scope.sortClass = function(col){
            return TableService.sortSelectedClass($scope.reverse, col, $scope.column);
        } 
		
        /***** End of Table Functions *****/

        //Clear
        function resetScope() {
            $scope.whouse = {};
            $scope.confirmPassword = {};

            //Uncheck all checkboxes and radio
            var checkboxes = document.getElementsByTagName('input');    
            for (var i = 0; i < checkboxes.length; i++){
                if(checkboxes[i].type == 'checkbox' || checkboxes[i].type == 'radio'){
                    checkboxes[i].checked = false;
                }
            }
        }
		
		
		/*
			Function name: getFields
			Date modified: 2-6-2018
			Description: get all fields for the warehouse model
		*/
		function getFields() {
			ModulesService.getModuleByName('warehouses').then(function(response){
               $scope.fields = response.fields;
               $scope.id = response._id;
               $scope.fieldsLength = Object.size(response.fields); 			   
            })
			.catch(function(err){
                alert(err.msg_error);
            });
		}
		getFields();
		
		
		/*
			Function name: getAllWH
			Date modified: 2-6-2018
			Description: get all data for warehouse
		*/
		function getAllWH() {
            ModulesService.getAllModuleDocs('warehouses').then(function (warehouse) {
                $scope.warehouses = warehouse;
                $scope.warehouseLength = Object.size(warehouse);
            
				/*** Function for getting asset count for each warehouse by getting all assets first then filtering ***/
				ModulesService.getAllModuleDocs('assets').then(function (assets) {
					$scope.assets = assets;
					$scope.assetsLength = Object.size(assets);
					
					
					for(var i = 0; i < $scope.warehouseLength; i++) {
						var quantity = 0;
					
						for(var j = 0; j < $scope.assetsLength; j++) {
							if($scope.assets[j].location == $scope.warehouses[i].name)
								quantity++;
						}
						
						$scope.warehouses[i].quantity = quantity;
						
						if($scope.viewModal == true) {
							if($scope.whouse.name == $scope.warehouses[i].name) {
								$scope.whouse.quantity = $scope.warehouses[i].quantity;
							}
						}
					}
				
				});
				/*** End of function for getting asset count ***/
			
			}).finally(function() {
				$scope.loading = false;
			});
        }
		getAllWH();
		
		function getAssetUpdate(){
            
            ModulesService.getAllModuleDocs('assets').then(function(assets) {
                    $scope.assets = assets;
                    $scope.assetsLength = Object.size(assets);

                    //loop warehouse
                    for (var i = 0; i<$scope.warehouseLength; i++){
                        var quantity = 0;
               

                        //loop assets then filter by warehouse
                        for (var j = 0; j<$scope.assetsLength; j++){
                            if ($scope.assets[j].location == $scope.warehouses[i].name){
                                quantity++;
                            }
                        }
                        $scope.warehouses[i].quantity = quantity;
						
						if($scope.viewModal == true) {
							if($scope.whouse.name == $scope.warehouses[i].name) {
								$scope.whouse.quantity = $scope.warehouses[i].quantity;
							}
						}
                    
                    }
                
            }).catch(function(error){
                FlashService.Error(error);
            })
        };
		
		
        // get realtime changess
        socket.on('whouseChange', function(){
            getAllWH();
        });
		socket.on('assetChange', function(){
            getAssetUpdate();
        });

/*
            Function name: Show different field types
            Author(s): Flamiano, Glenn
            Date Modified: 01/26/2018
            Description: To hide/show different input types
            Parameter(s): none
            Return: boolean
        */
        $scope.showInputType = function(data){
            return InputTypeService.showInputTypes(data);
        };

        /*
            Function name: Array remove element function
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/24
            Description: Remove and element in an array
            Parameter(s): none
            Return: size
        */
        Array.prototype.remove = function() {
            return InputTypeService.arrayRemove();
        };

        /*
            Function name: Insert formatted date $scope.whouse
            Author(s): Omugtong, Jano
            Date Modified: 2018/04/17
            Description: To format a date and to be inserted to $scope.whouse
            Parameter(s): fieldName, inputDate
            Return: update $scope.whouse
        */
        $scope.pushDateToAllEntry = function(fieldName, inputDate) {
            $scope.whouse[fieldName] = InputTypeService.formatDate(inputDate);
        };


        /*
            Function name: Get all checkbox elements
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/31
            Description: Get all checkbox elements and set dynamic temporary variables for checked items
            Parameter(s): none
            Return: none
        */
        var selected = [];
        var checkboxFields = [];
        var selectedLength = 0;
        $scope.declareSelected = function(){
            $scope.showMainFlash = false;

            var select = InputTypeService.declareSelected(selected, checkboxFields, selectedLength);
            console.log(select);
            selected = select.selected;
            selectedLength = select.selectedLength;
        };

        /*
            Function name: Insert radio button value to $scope.aUsers
            Author(s): Flamiano, Glenn
            Date Modified: February 2018
            Description: To insert radio button value to $scope.aUsers, it is called
                when radio button is checked
            Parameter(s): option, fieldName
            Return: none
        */
        $scope.putToModel = function(option, fieldName){
            //console.log(option);
            $scope.aDevices[fieldName] = option;
        }

        /*
            Function name: isChecked
            Author(s): Reccion, Jeremy
            Date Modified: 2018/01/31
            Description: Check an option of the checkbox if checked
            Parameter(s): field.name, checkbox element
            Return: none
        */
        $scope.isChecked = function(field_name, option){
            return InputTypeService.isChecked(field_name, option, $scope.aDevices);
        };


        /*
            Function name: Insert checkbox checked values to
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/26
            Description: Check all password inputs in add modal     //??? wrong description?
            Parameter(s): field.name, checkbox element
            Return: none
        */
        $scope.pushToAwhouse = function(fieldName, option){
            $scope.aDevices[fieldName] = InputTypeService.pushToAllEntry(fieldName, option, selected);
        }; 


        // added add function
        $scope.addWH = function(isValid){
            $scope.showAddFlash = true;
            for (var i = 0; i < $scope.fieldsLength; i++){
                if ($scope.fields[i].required && $scope.whouse[$scope.fields[i].name] == null){
                    $scope.formValid = false;
                }
            }
            if(!$scope.formValid){
                FlashService.Error($rootScope.selectedLanguage.commons.fmrequiredFields);
                $scope.formValid = true;
            }else{
                if(InputValidationService.AllValid($rootScope.selectedLanguage.commons, $scope.fields, $scope.newAsset, $scope.confirmPassword)){
                    
                    ModulesService.addModuleDoc({moduleName: 'warehouses', moduleDoc: $scope.whouse})
                    .then(function () {
                        $('#myModal').modal('hide');
                        FlashService.Success($rootScope.selectedLanguage.warehouse.labels.flash_add);
                        socket.emit('whouseChange');
						
						resetScope();
						resetModalFlash();
                    })
                    .catch(function (error) {
                        if(error.exists){
                            FlashService.Error($scope.whouse.name + " " + $rootScope.selectedLanguage.warehouse.labels.flash_taken);
                        }
                        else{
                            errorFunction(error);
                        }
                    });
                  
                }  
            }
        };

      
        /*
            Function name: Filter Table Row by Index
            Author(s): Flamiano, Glenn
            Date Modified: January 2018
            Description: Retrieve specific table row by index
            Parameter(s): all table rows, index
            Return: none
        */
        function filterIndexById(input, id) {
            var i=0, len=Object.size(input);
            for (i=0; i<len; i++) {
                if (input[i]._id == id) {
                    return input[i];
                }
            }
        }

        $scope.editWH = function(index){
            $scope.unEditAble = true;
            $scope.whouse = angular.copy(filterIndexById($scope.warehouses, index));
			$scope.viewModal = true;
        };

        /*

        */
        vm.editAble = function(){
            $scope.unEditAble = false;
            //this is to initialize dropdowns that were added after adding warehouses
            //loop the fields to initialize value of a dropdown to the first item of its options if it is undefined
            angular.forEach($scope.fields, function(value, key){
                //initialize if the dropdown is required
                //when editing, non existing property may be undefined or ''
                if(value.type == 'dropdown' && value.required && ($scope.whouse[value.name] == undefined || $scope.whouse[value.name] == '')){                    
                        $scope.whouse[value.name] = value.options[0];
                }
            });
        };
		
		vm.cancelEdit = function() {
            $scope.viewModal = false;
			$scope.whouse = {};			
			getAllWH();
            resetModalFlash();
            $scope.showMainFlash = false;
		}
		
		
		vm.updateWH = function(isValid) {
            $scope.showEditFlash = true;
            for (var i = 0; i < $scope.fieldsLength; i++){
                if ($scope.fields[i].required && $scope.whouse[$scope.fields[i].name] == null){
                    $scope.formValid = false;
                }
                if ($scope.fields[i].required && $scope.whouse[$scope.fields[i].name] == ""){
                    $scope.formValid = false;
                }
            }

            if(!$scope.formValid){
                FlashService.Error($rootScope.selectedLanguage.commons.fmrequiredFields);
                //resetwhouse();
                $scope.formValid = true;
            }else{
                if(InputValidationService.AllValid($rootScope.selectedLanguage.commons, $scope.fields, $scope.newAsset, $scope.confirmPassword)){
                    
                    ModulesService.updateModuleDoc({moduleName: 'warehouses', moduleDoc: $scope.whouse})
                        .then(function () {
							$scope.viewModal = false;							
                            $scope.whouse = {};
                            $('#editModal').modal('hide');
                            FlashService.Success($rootScope.selectedLanguage.warehouse.labels.flash_update);
                            socket.emit('whouseChange');
							
							resetScope();
							resetModalFlash();
                    })
                    
                    .catch(function (error) {
                        errorFunction(error);
                    });
         
                }  
            }
        }		
        
        /*
            Name: modify dropdown 
            Author(s):
                    Reccion, Jeremy
            Date modified: 2018/03/06
            Descrption: initialize dropdown values if they are required
        */
        $scope.modifyDropdown = function(){
            //this is to initialize dropdowns that were added after adding assets
            //loop the fields to initialize value of a dropdown to the first item of its options if it is undefined
            angular.forEach($scope.fields, function(value, key){
                //initialize if the dropdown is required
                if(value.type == 'dropdown' && value.required){
                    $scope.whouse[value.name] = value.options[0];
                }
            });
        };

		//deleteUser function
		$scope.deleteWH = function(index) {
            
            var toDel = filterIndexById($scope.warehouses, index);

            if (confirm($rootScope.selectedLanguage.warehouse.labels.flash_confirm_1 + toDel.name + $rootScope.selectedLanguage.warehouse.labels.flash_confirm_2)){
				
            ModulesService.deleteModuleDoc('warehouses', toDel._id)
                 .then(function () {
					resetModalFlash();
                    FlashService.Success($rootScope.selectedLanguage.warehouse.labels.flash_delete);
                    socket.emit('whouseChange');
					 
                })
                .catch(function (error) {
                    errorFunction(error);
                });
            }
        }

        function errorFunction(error){
            if(error.code == 11000){
                FlashService.Error($rootScope.selectedLanguage.warehouse.labels.flash_exist);
            }
            else if(error.name == 'ValidationError'){
                FlashService.Error(error.message);
            }
            else{
                FlashService.Error(error);
            }
        }
    }
 
})();