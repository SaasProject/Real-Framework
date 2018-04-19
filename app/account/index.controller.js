(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('Account.IndexController', Controller)
        .directive('fileModel', ['$parse', function($parse) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var parsedFile = $parse(attrs.fileModel);
                    var parsedFileSetter = parsedFile.assign;

                    element.bind('change', function() {
                        scope.$apply(function() {
                            parsedFileSetter(scope, element[0].files[0]);
                        });
                    });
                }
            };
        }]);
 
    function Controller($window, UserService, UploadService, FlashService, $scope, ModulesService, LanguageService, $rootScope, $timeout) {
        var vm = this;
 
        vm.user = null;
        vm.saveUser = saveUser;
		vm.saveUserPassword = saveUserPassword;
        vm.deleteUser = deleteUser;
        $scope.aUsers = {};
        $scope.confirmPassword = {};
		$scope.isUser = false;
        $scope.showPicFlash = false;
        $scope.isDelete = false;

        //show account or system settings
        $scope.isAccountSetting = true;
        $scope.isSystemSetting = false;

        $scope.showLangChangeFlash = false;

        function getLanguages(){
            //get default language
            LanguageService.getDefaultLanguage()
                .then(function(res) {
                    $scope.dropDefLangSel = Object.keys(res)[0];
                })
                .catch(function (error) {
                });
        }

        getLanguages();

        $scope.changeDefaultLanguage = function(option) {
            //save selected default language to database
            LanguageService.saveDefaultLanguage(vm.user, option);
            $scope.defaultOption = option;
            //add this conditions when adding new language json files
            if(option == 'nihongo'){
                $scope.dropDefLangSel = '日本語';
            } else if (option == 'english') {
                $scope.dropDefLangSel = 'English';
            }
        }

        $scope.defaultLanguageChangeSuccess = function(language){
            var lang = '';
            //add this conditions when adding new language json files
            if(language == 'nihongo'){
                lang = '日本語';
            } else if(language == 'english') {
                lang = 'English';
            }
            $scope.flashDefaultLangChanged = $rootScope.selectedLanguage.accountSettings.flashMessages.defaultLanguageChangedTo1
                +lang+$rootScope.selectedLanguage.accountSettings.flashMessages.defaultLanguageChangedTo2;
            $scope.showLangChangeFlash = true;
        }

        $scope.showSettings = function(option) {
            $scope.showLangChangeFlash = false;
            if(option == 'system'){
                $scope.isAccountSetting = false;
                $scope.isSystemSetting = true;
            } else if (option == 'account') {
                $scope.isAccountSetting = true;
                $scope.isSystemSetting = false;
            }
        }

        /*
            Function name: Initialize Profile Picture
            Author(s): Flamiano, Glenn
            Date Modified: 2018/03/01
            Description: Initialization for User Profile Picture Display
            Parameter(s): none
            Return: none
        */
        function loadProfilePic(){
            $scope.modalPic = '/nullPic.jpg';
            if($rootScope.profilePic !== ''){
                $scope.modalPic = $rootScope.profilePic;
                $scope.isDelete = true;
            }
            $scope.tempPic = '';
            $scope.profilePicUrl = $rootScope.profilePic;
        }
        loadProfilePic();

        $scope.isSave = false;

        $scope.resetModalButtons = function(){
            $scope.isSave = false;
        }

        /*
            Function name: Get all checkbox elements
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/31
            Description: Get all checkbox elements and set dynamic temporary variables for checked items
            Parameter(s): none
            Return: none
        */
        var selected = [];
        var selectedLength = 0;
        var checkboxFields = [];
        function declareSelected(){
            checkboxFields = document.getElementsByName("checkBoxInput checkbox");
            //console.log(checkboxFields);
            for(var i=0;i<checkboxFields.length;i++){
                selected[checkboxFields[i].className] = [];
                selectedLength++;
                //console.log(checkboxFields[i].className+' '+selected[checkboxFields[i].className]);
            }
        }
        
        
        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                $scope.aUsers = user;

                loadProfilePic();

                angular.forEach($scope.fields, function(value, key){
                    //initialize if the dropdown is required
                    //console.log($scope.aUsers[value.name])
                    //when editing, non existing property may be undefined or ''
                    if(value.type == 'dropdown' && value.required && ($scope.aUsers[value.name] == undefined || $scope.aUsers[value.name] == '')){
                        $scope.aUsers[value.name] = value.options[0];
                    }
                });
                
                declareSelected();
				
				
				if(vm.user.role != 'Admin') {
					$scope.isUser = true;			
				}
				else {
					$scope.isUser = false;
				}	
				
				
                //in order to restart initcontroller to make sure selected checkboxes are declared
                //by restarting init controller if NodeList has no length.
                // if(selectedLength == 0){
                    // initController();
                // } else {
                 //   Nodelist has length
                // }
            });
        }

        /*
            Function name: Show different field types
            Author(s): Flamiano, Glenn
            Date Modified: 01/26/2018
            Description: To hide/show different input types
            Parameter(s): none
            Return: boolean
        */
        $scope.showTextBox = function(data){
            if(data == 'text'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showEmail = function(data){
            if(data == 'email'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showNumber = function(data){
            if(data == 'number'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showPassword = function(data){
            if(data == 'password'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showTextArea = function(data){
            if(data == 'textarea'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showCheckBox = function(data){
            if(data == 'checkbox'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showDropDown = function(data){
            if(data == 'dropdown'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showRadio = function(data){
            if(data == 'radio'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showDate = function(data){
            if(data == 'date'){
                return true;
            } else {
                return false;
            }
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
            var what, a = arguments, L = a.length, ax;
            while (L && this.length) {
                what = a[--L];
                while ((ax = this.indexOf(what)) !== -1) {
                    this.splice(ax, 1);
                }
            }
            return this;
        };

        /*
            Function name: Format date
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/25
            Description: To format a date and to be inserted to $scope.aUsers
            Parameter(s): none
            Return: formatted date
        */
        function formatDate(date) {
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        }

        /*
            Function name: Insert formatted date to $scope.aUsers
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/25
            Description: To iformat a date and to be inserted to $scope.aUsers
            Parameter(s): none
            Return: none
        */
        $scope.pushDateToAUsers = function(fieldName, inputDate) {
            //console.log('push date');
            $scope.aUsers[fieldName] = formatDate(inputDate);
        };

        /*
            Function name: Validate email inputs
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/25
            Description: Check all email inputs in add/edit modal
            Parameter(s): none
            Return: boolean
        */
        function checkEmails(){
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var myRows = document.getElementsByName('email');
            var allValid = true;
            for(var i=0;i<myRows.length;i++){ 
                //console.log('aaaaaa', myRows[i].value);
                if(myRows[i].value != ''){
                    //console.log(myRows[i].value+' grrrr '+re.test(myRows[i].value.toLowerCase()));
                    if(!re.test(myRows[i].value.toLowerCase())){
                        allValid = false;
                    }
                }
            } 
            return allValid;
        };

        /*
            Function name: Validate number inputs
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/26
            Description: Check all number inputs in add/edit modal
            Parameter(s): none
            Return: boolean
        */
        function checkNumbers(){
            var myRows = document.getElementsByName('number');
            var allValid = true;
            for(var i=0;i<myRows.length;i++){ 
                if(myRows[i].value != ''){
                    if(isNaN(myRows[i].value)){
                        allValid = false;
                    }
                }
            } 
            return allValid;
        };

        /*
            Function name: Validate password strength
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/26
            Description: Check password if it contains a lowercase, uppercase, number, and is 8 characters
            Parameter(s): none
            Return: boolean
        */
        function checkPasswordChars(password){
            var points = 0;
            var valid = false;

            // Validate lowercase letters
            var lowerCaseLetters = /[a-z]/g;
            if(password.match(lowerCaseLetters)) {  
                points += 1;
            }

            // Validate capital letters
            var upperCaseLetters = /[A-Z]/g;
            if(password.match(upperCaseLetters)) {  
                points += 1;
            }

            // Validate numbers
            var numbers = /[0-9]/g;
            if(password.match(numbers)) {  
                points += 1;
            }

            // Validate length
            if(password.length >= 8) {
                points += 1;
            }

            // if points = 4 return true
            if(points == 4){
                valid = true;
            }
            
            return valid;
        }

        /*
            Function name: Validate password inputs
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/26
            Description: Check all password inputs in add/edit modal
            Parameter(s): none
            Return: boolean
        */
        function checkPasswords(){
            var myRows = document.getElementsByName('password');
            var allValid = true;
            for(var i=0;i<myRows.length;i++){ 
                if(myRows[i].value != ''){
                    if(!checkPasswordChars(myRows[i].value)){
                        allValid = false;
                    }
                }
            } 
            return allValid;
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
            $scope.aUsers[fieldName] = option;
        }

        /*
            Function name: Validate confirm passwords
            Author(s): Flamiano, Glenn
                       Reccion, Jeremy
            Date Modified: 2018/02/01
            Description: Check all password inputs in add/edit modal
            Parameter(s): none
            Return: boolean
        */
        function checkConfirmPasswords(){
            var allValid = true;
            for(var i in $scope.fields){
                var currentField = $scope.fields[i];
                
                //validation for password
                if(currentField.type == 'password'){
                    if($scope.aUsers[currentField.name] == ''){
                        $scope.confirmPassword[currentField.name] = '';
                    }
                    if($scope.aUsers[currentField.name] != $scope.confirmPassword[currentField.name]){
                        allValid = false;
                    }
                }
            }
            return allValid;
        };

        /*
            Function name: isChecked
            Author(s): Reccion, Jeremy
            Date Modified: 2018/01/31
            Description: Check an option of the checkbox if checked
            Parameter(s): field.name, checkbox element
            Return: none
        */
        $scope.isChecked = function(field_name, option, type){
            if(type == 'checkbox'){
                if($scope.aUsers[field_name] == undefined) $scope.aUsers[field_name] = [];
                var isChecked = ($scope.aUsers[field_name].indexOf(option) != -1) ? true : false;
                //console.log(isChecked);
                return isChecked;
            }
        };

        /*
            Function name: isRadioSelected
            Author(s): Reccion, Jeremy
            Date Modified: 2018/01/31
            Description: Check an option of the radio button if checked
            Parameter(s): field.name, html input type
            Return: none
        */
        $scope.isRadioSelected = function(field_name, option, type){
            if(type == 'radio'){
                if($scope.aUsers[field_name] == undefined) $scope.aUsers[field_name] = [];
                var isChecked = ($scope.aUsers[field_name].indexOf(option) != -1) ? true : false;
                //console.log(isChecked);
                return isChecked;
            }
        };

        /*
            Function name: Insert checkbox checked values to
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/26
            Description: Check all password inputs in add modal
            Parameter(s): field.name, checkbox element
            Return: none
        */
        $scope.pushToAUsers = function(fieldName, option){
            var checkedOption = document.getElementsByName(option);
            //console.log(selected['checkBoxAdd '+fieldName]);
            if(checkedOption[0].checked){
                selected['checkBoxAdd '+fieldName].push(option);
            }else{
                selected['checkBoxAdd '+fieldName].remove(option);
            }
            //console.log(selected['checkBoxAdd '+fieldName]);
            $scope.aUsers[fieldName] = selected['checkBoxAdd '+fieldName];
        };

        $scope.id = "";
        $scope.fields = [];
        $scope.name = 'users';
        function getAllFields(){
            ModulesService.getModuleByName($scope.name).then(function(response){
    
                $scope.fields = response.fields;
                $scope.id = response._id;
                
            }).catch(function(err){
                alert(err.msg_error);
            });
        };
        
        getAllFields();
        initController();
		
		
		
		$scope.readOnly = function(field) {
			if(field == 'email' || field == 'firstName' || field == 'lastName' || field == 'role')
				return true;
		}

        /*
            Function name: Update User Function
            Author(s): Sanchez, Macku
            Date Modified: January 2018
            Description:  Update User
        */
 
         function saveUser() {
                    var requiredTextField=0;
                    var forDataBase=0;
                    for(var h in $scope.fields){
                        if($scope.fields[h].required==true){
                            requiredTextField++;
                            if($scope.aUsers[$scope.fields[h].name]===undefined){
                                FlashService.Error($rootScope.selectedLanguage.commons.fmrequiredFields);
                            }else{
                                forDataBase++;
                            }
                        }
                    }

                    if(!checkEmails()){
                        FlashService.Error($rootScope.selectedLanguage.commons.invalidEmail);
                    }else if(!checkNumbers()){
                        FlashService.Error($rootScope.selectedLanguage.commons.invalidNo);
                    }else if(!checkPasswords()){
                        FlashService.Error($rootScope.selectedLanguage.commons.containPass);
                    }else if(!checkConfirmPasswords()){
                        FlashService.Error($rootScope.selectedLanguage.commons.confirmPass);
                    }else{
                        if(forDataBase===requiredTextField){
                            UserService.Update(vm.user)
                                .then(function () {
                                    FlashService.Success($rootScope.selectedLanguage.accountSettings.flashMessages.userUpdated);
									initController();
                                })
                                .catch(function (error) {
                                    FlashService.Error(error);
                                });
                        }
                    }
                
            
        }
		
		function saveUserPassword() {
			$rootScope.changePasswordModal = true;
			
			if(vm.user.oldPassword === undefined) {
				FlashService.Error($rootScope.selectedLanguage.accountSettings.flashMessages.inputOldPassword);
			} else { 
				if(vm.user.password===undefined){
					FlashService.Error($rootScope.selectedLanguage.accountSettings.flashMessages.inputNewPassword);
				} else {
					if(!checkPasswordChars(vm.user.password)) {
						FlashService.Error($rootScope.selectedLanguage.commons.containPass);
					} else {
						if(vm.user.password != vm.user.confirmPassword) {
							FlashService.Error($rootScope.selectedLanguage.commons.confirmPass);
						} else {
                            //console.log(vm.user);
                            vm.user.preferedLanguage = $rootScope.selectedLanguage;
                            UserService.Update(vm.user)
                                .then(function () {
								//	$('#pwModal').modal('hide');
									FlashService.Success($rootScope.selectedLanguage.manageAccounts.flashMessages.passwordChangedSuccessfully);
									initController();
							
                                })
                                .catch(function (error) {
                                    FlashService.Error(error);
                                });
                        
						}
						
						
					}
			
				}
				
			}
			
        }
		
		$scope.closeModal = function() {
			$rootScope.changePasswordModal = false;
			delete $rootScope.flash;
			initController();
		}
 
        function deleteUser() {

            if (confirm("sure to delete?")){


            UserService.Delete(vm.user._id)
                .then(function () {
                    // log user out
                    $window.location = '/login';
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
            }
        }

        /*
            Function name: Submit Profile Picture
            Author(s): Flamiano, Glenn
            Date Modified: 2018/03/01
            Description: Sends the input file to the app-services/user.service.js when exported
                UploadFile service is called.
            Parameter(s): none
            Return: none
        */
        $scope.Submit = function() {
            var pathUsed = 'profile_pictures';
            var dbName = 'users';
            UploadService.uploadFile($scope.file, vm.user, pathUsed, dbName)
            .then(function(res) {
                $scope.uploading = false;
                $scope.file = {};
                FlashService.Success($rootScope.selectedLanguage.accountSettings.flashMessages.profilePicUpdated);
                //$scope.modalPic = $scope.tempPic;
                $scope.profilePicUrl = $scope.tempPic;
                $rootScope.profilePic = $scope.profilePicUrl;
                $scope.tempPic = '';
                $scope.isDelete = true;
            })
            .catch(function (error) {
                FlashService.Error(error);
            });
            $('#myModal').modal('hide');
            $scope.showPicFlash = false;
        }

        /*
            Function name: Split by last dot
            Author(s): Flamiano, Glenn
            Date Created: 2018/03/05
            Date Updated: 2018/03/05
            Description: Gets file name and extension and returns the file extension by last dot
            Parameter(s): text
            Return: text after last dot
        */
        function splitByLastDot(text) {
            var index = text.lastIndexOf('.');
            return [text.slice(0, index), text.slice(index + 1)]
        }

        /*
            Function name: Browse Photo
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/31
            Description: Retrieves input file from browse button to be submitted
            Parameter(s): input file
            Return: none
        */
        $scope.photoChanged = function(files) {
            var fileName = document.getElementById("profileImg").value;
            if (splitByLastDot(fileName)[1] == "jpeg" || splitByLastDot(fileName)[1] == "JPEG" 
                || splitByLastDot(fileName)[1] == "jpg" || splitByLastDot(fileName)[1] == "JPG"
                || splitByLastDot(fileName)[1] == "png" || splitByLastDot(fileName)[1] == "PNG") {  
                $scope.showPicFlash = false;
                if (files.length > 0 && files[0].name.match(/\.(png|jpeg|jpg|PNG|JPEG|JPG)$/)) {
                    $scope.uploading = true;
                    var file = files[0];
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(file);
                    fileReader.onload = function(e) {
                        $timeout(function() {
                            $scope.modalPic = e.target.result;
                            $scope.tempPic = e.target.result;
                            $scope.uploading = false;
                            $scope.isDelete = false;
                        });
                    };
                    $scope.isSave = true;
                } else {
                    $scope.tempPic = '';
                    $scope.modalPic = '';
                }
            } else if(fileName == ''){
                //do nothing
            } else {  
                //show flash message
                $scope.showPicFlash = true;
            }
            
        }

        /*
            Function name: Remove Profile Picture
            Author(s): Flamiano, Glenn
            Date Modified: 2018/03/08
            Update date: 2018/03/08
            Description: Remove profile picture in the server and database
            Parameter(s): none
            Return: none
        */
        $scope.deletePic = function(){
            if (confirm($rootScope.selectedLanguage.accountSettings.flashMessages.profilePicDeleteSure)){
                var pathForDelete = 'profile_pictures/';
                var dbName = 'users';
                UploadService.deleteFile(vm.user, pathForDelete, dbName)
                .then(function(res) {
                    FlashService.Success($rootScope.selectedLanguage.accountSettings.flashMessages.profilePicDeleted);
                    $scope.profilePicUrl = '';
                    $rootScope.profilePic = '';
                    $scope.modalPic = '/nullPic.jpg';
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
                $('#myModal').modal('hide');
                $scope.isDelete = false;
            }
        }

        /*
            Function name: Reset Modal Picture
            Author(s): Flamiano, Glenn
            Date Modified: 2018/03/01
            Description: Resets Modal Picture Elements After Modal Close
            Parameter(s): none
            Return: none
        */
        $scope.resetModalPic = function() {
            $scope.modalPic = '/nullPic.jpg';
            if($rootScope.profilePic !== ''){
                $scope.modalPic = $rootScope.profilePic;
                $scope.isDelete = true;
            }
            $scope.showPicFlash = false;
        }
    }
 
})();