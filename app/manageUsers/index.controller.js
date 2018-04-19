/*
    Name: Manage Users Controller
    Date Created: 01/03/2018
	Date Modified: April 2018
    Author(s): Sanchez, Macku
               Flamiano, Glenn  
			   Ayala, Jenny
*/

(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('ManageUsers.IndexController', Controller)

        /*
            Function name: Object filter
            Author(s): Flamiano, Glenn
            Date Modified: December 2017
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
            Date Modified: December 2017
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
 
    function Controller(UserService, $scope, FlashService, ModulesService, TableService, socket, $rootScope, InputValidationService, InputTypeService) {
       
		//scope for users
		$scope.allUsers = {};
		$scope.newUser = {};
		
		$scope.loading = true;
        $scope.confirmPassword = {};
		$scope.unEditAble = false;

        /*
            Function name: Calculate Object size
            Author(s): Flamiano, Glenn
            Date Modified: January 2018
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

        // initialize pages of user list
        $scope.currentPage = 1;
        $scope.pageSize = 10;


        // Table sort functions
        $scope.column = 'role'; //column to be sorted
        $scope.reverse = false; // sort ordering (Ascending or Descending). Set true for desending

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
            Date Modified: December 2017
            Description: To change column sort arrow UI when user clicks the column
            Parameter(s): column
            Return: none
        */
        $scope.sortClass = function(col){
            return TableService.sortSelectedClass($scope.reverse, col, $scope.column);
        } 

        /*
            Function name: Show Column
            Author(s): Flamiano, Glenn
            Date Modified: April 17, 2018
            Description: To display maximum number of columns by field index
            Parameter(s): column
            Return: none
        */
        $scope.sortClass = function(col){
            return TableService.sortSelectedClass($scope.reverse, col, $scope.column);
        } 

        // End of Table Functions

        /*
            Function name: Reset user scope
            Author(s): Flamiano, Glenn
            Date Modified: January 2018
            Description: To reinitialize the $scope.AUsers variable used for CRUD
            Parameter(s): none
            Return: none
        */
        function resetNewUser () {
            $scope.newUser = {};
           
            selected = [];
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
            Function name: initController
            Author(s): Flamiano, Glenn; Ayala,Jenny
            Date Modified: April 2018
            Description: Retrieves all user data from users collection in mongoDB
            Parameter(s): none
            Return: none
        */
        function initController() {
            UserService.GetAll().then(function (user) {
                $scope.allUsers = user;
                $scope.userLength = Object.size(user);
            }).finally(function() {
				$scope.loading = false;
			});
        }
		initController();
 
        // get realtime changes
        socket.on('userChange', function(){
            initController();
        });

		
		
       //scope variables for user fields
        $scope.id = "";
        $scope.fields = [];
		
        /*
            Function name: Get all user fields 
            Author(s):
            Date Modified: January 2018
            Description: Retrieves fields array from user document from fields collection in mongoDB
            Parameter(s): none
            Return: none
        */
        function getAllFields(){
			
            ModulesService.getModuleByName('users').then(function(response){
               $scope.fields = response.fields;
               $scope.id = response._id;
              
               $scope.fieldsLength = Object.size(response.fields);
                
            }).catch(function(err){
                alert(err.msg_error);
            });
        };
        getAllFields();

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
            Function name: Insert formatted date to $scope.aDevices
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/25
            Description: To iformat a date and to be inserted to $scope.aDevices
            Parameter(s): none
            Return: none
        */
        $scope.pushDateToAllEntry = function(fieldName, inputDate) {
            $scope.aDevices[fieldName] = InputTypeService.formatDate(inputDate);
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
        $scope.pushToANewUser = function(fieldName, option){
            $scope.aDevices[fieldName] = InputTypeService.pushToAllEntry(fieldName, option, selected);
        };

        
        /*
            Name: modify dropdown 
            Author(s):
                    Reccion, Jeremy
            Date modified: 2018/03/06
            Descrption: initialize dropdown values if they are required
        */
        $scope.modifyDropdown = function(){
            //this is to initialize dropdowns that were added after adding users
            //loop the fields to initialize value of a dropdown to the first item of its options if it is undefined
            angular.forEach($scope.fields, function(value, key){
                //initialize if the dropdown is required
                if(value.type == 'dropdown' && value.required){
                    $scope.newUser[value.name] = value.options[0];
                }
            });
        };

        
        /*
            Function name: Add User Function
            Author(s): Sanchez, Macku; Ayala, Jenny
            Date Modified: January 2018
            Description: Adds New User and Assigns a Temporary Password to the New User
        */
        $scope.addUser = function(){
			
            delete $rootScope.flash;
            $scope.showAddFlash = true;

            var requiredTextField=0; //number of required fields
            var forDataBase=0; //number of required fields w/ input

            for(var h in $scope.fields){
                if($scope.fields[h].required==true){
                    requiredTextField++;
					 
                    if($scope.newUser[$scope.fields[h].name]===undefined || $scope.newUser[$scope.fields[h].name]===null){
						if($scope.fields[h].name == 'email') {
							FlashService.Error($rootScope.selectedLanguage.commons.invalidEmail);
						}
						else {
							FlashService.Error($rootScope.selectedLanguage.commons.fmrequiredFields);
						}
                         break;
                    }
					else{
                         forDataBase++;
                    }
                }
            }
			
			if(InputValidationService.AllValid($rootScope.selectedLanguage.commons, $scope.fields, $scope.newUser, $scope.confirmPassword)){
				
				if(forDataBase==requiredTextField){
					UserService.Insert($scope.newUser)
						.then(function () {
							$('#myModal').modal('hide');
							FlashService.Success($rootScope.selectedLanguage.manageAccounts.flashMessages.userAdded);
							initController();
							resetModalFlash();
                        resetNewUser();
					}).catch(function (error) {
						if(error.exists){
							FlashService.Error($rootScope.selectedLanguage.manageAccounts.flashMessages.emailErr);
						}
						else if(error.invalid){
							FlashService.Error($rootScope.selectedLanguage.commons.invalidEmail);
						}
						else{
							FlashService.Error(error);
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
		
		
		/*
            Name: enable edit
            Author(s):
                    Flamiano, Glenn
                    Reccion, Jeremy
            Date modified: 2018/03/06
            Descrption: set the values of certain scope variables. also initialize dropdown values if they are required
        */
        $scope.enableEditing = function() {
			
            $scope.unEditAble = false;
            angular.forEach($scope.fields, function(value, key){
                //initialize if the dropdown is required
                //console.log($scope.newUser[value.name])
                //when editing, non existing property may be undefined or ''
                if(value.type == 'dropdown' && value.required && ($scope.newUser[value.name] == undefined || $scope.newUser[value.name] == '')){
                    $scope.newUser[value.name] = value.options[0];
                }
            });
        }

        /*
            Function name: edit User
            Author(s):
            Date Modified: January 2018
            Description: When user clicks edit on the table, the selected row $scope is copied to $scope.aUsers
            Parameter(s): index
            Return: none
        */
        $scope.editUser = function(index){
            $scope.unEditAble = true;
            $scope.newUser = angular.copy(filterIndexById($scope.allUsers, index));
        };
		
		
		/*
            Function name: Update User Function
            Author(s): Sanchez, Macku; Ayala, Jennny
            Date Modified: April 2018
            Description: Update User
        */
		$scope.updateUser = function() {
			$scope.showEditFlash = true;
			
			var requiredTextField=0;
            var forDataBase=0;

            for(var h in $scope.fields){
                if($scope.fields[h].required==true){
                    requiredTextField++;
                    if($scope.newUser[$scope.fields[h].name]===undefined){
                        FlashService.Error($rootScope.selectedLanguage.commons.fmrequiredFields);
                    }else{
                        forDataBase++;
                    }
                }
            }
			
			if(InputValidationService.AllValid($rootScope.selectedLanguage.commons, $scope.fields, $scope.newUser, $scope.confirmPassword)){
				
				if(forDataBase==requiredTextField){
					UserService.Update($scope.newUser)
                        .then(function () {
                            initController();
                            $('#editModal').modal('hide');
                            FlashService.Success($rootScope.selectedLanguage.manageAccounts.flashMessages.userUpdated);
                        }).catch(function (error) {
                            FlashService.Error(error);
                        }); 
						
                        resetNewUser();
                        resetModalFlash();
				}
			}
        }
		
		
		/*
            Function name: Delete User Function
            Author(s): Sanchez, Macku
            Date Modified: January 2018
            Description: Delet eUser
        */
		$scope.deleteUser = function(index) {
			
			
			var toDel = filterIndexById($scope.allUsers, index);

                if (confirm($rootScope.selectedLanguage.manageAccounts.flashMessages.confirmMessage)){deleteUserino();}
    				
                
                function deleteUserino(){

                 UserService.Delete(toDel._id)
                     .then(function () {
    					resetModalFlash();
                        FlashService.Success($rootScope.selectedLanguage.manageAccounts.flashMessages.userDeleted);
                        socket.emit('userChange');
    					 
                    })
                    .catch(function (error) {
                        if(error.self_delete){
                            window.location.href = '/login';
                        }
                        else{
                            FlashService.Error(error);
                        }
                    });
                }
            
        }


 
		
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

        $scope.restart = function() {
            initController();
            resetNewUser();
            resetModalFlash();
            $scope.showMainFlash = false;
        }

    }
 
})();