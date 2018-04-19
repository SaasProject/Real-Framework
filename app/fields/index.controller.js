(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('Fields.IndexController', Controller)
 
    function Controller($scope, ModulesService, FlashService, $rootScope){
        //$scope.newModule = {};
        $scope.module = {
            name: 'assets',
            fields: []
        }
        $scope.newField = {
            name: '',
            required: false,
            unique: false,
            default: false,
            type: 'text'
        }
        $scope.fieldOptions = '';

        $scope.hasOptions = function(){
            return ($scope.newField.type == 'dropdown' || 
            $scope.newField.type == 'checkbox' || 
            $scope.newField.type == 'radio') ? true : false;
        }

        $scope.getModuleByName = function(){
            ModulesService.getModuleByName($scope.module.name).then(function(aModule){
                $scope.module = aModule;
            }).catch(function(err){

            });
        }

        $scope.resetFlash = function(){
            FlashService.Reset();
            $scope.newField = {
                name: '',
                required: false,
                unique: false,
                type: 'text'
            }
            $scope.fieldOptions = '';
        }

        $scope.getModuleByName();

        /* ModulesService.getAllModules().then(function(modules){
            $scope.modules = modules;
        }).catch(function(err){
            alert(err);
        }); */

        /* $scope.submit = function(){
            console.log($scope.newModule);
            if($scope.newModule.name == 'users'){
                alert('cannot have "users" collection');
            }
            else if($scope.newModule._id == undefined){
                ModulesService.addModule($scope.newModule).then(function(){
                    alert('added');
                }).catch(function(err){
                    alert('cannot add');
                });
            }
            else{
                ModulesService.updateModule($scope.newModule).then(function(){
                    alert('updated');
                }).catch(function(err){
                    alert('cannot update');
                });
            }
            
        } */

        /* $scope.editModule = function(aModule){
            angular.copy(aModule, $scope.newModule);
        } */

        $scope.editField = function(aField){
            angular.copy(aField, $scope.newField);
            if($scope.hasOptions()){
                $scope.fieldOptions = aField.options.toString();
            }
            else{
                $scope.fieldOptions = '';
            }
        }

        $scope.saveField = function(){

            //change this check
            var doesExists = -1;
            if($scope.newField.id){
                doesExists = $scope.module.fields.findIndex(function(x){
                    return x.name.toLowerCase() == $scope.newField.name.toLowerCase() 
                    && x.id != $scope.newField.id;
                });
            }
            else{
                doesExists = $scope.module.fields.findIndex(function(x){
                    return x.name.toLowerCase() == $scope.newField.name.toLowerCase();
                });
            }

            if(doesExists == -1){
                //sample
                if($scope.hasOptions() && $scope.fieldOptions == ''){
                    FlashService.Error($rootScope.selectedLanguage.fields.flashMessages.noOptions);
                }
                else{
                    
                    if($scope.hasOptions() && $scope.fieldOptions != ''){
                        $scope.newField.options = $scope.fieldOptions.split(',');
                    }

                    var forSave = {
                        moduleName: $scope.module.name,
                        field: $scope.newField
                    }
    
                    if($scope.newField.id == undefined){
                        ModulesService.addModuleField(forSave).then(function(){
                            //alert('field added');
                            FlashService.Success($rootScope.selectedLanguage.fields.flashMessages.added);
                            $scope.getModuleByName();
                            $scope.newField = {
                                name: '',
                                required: false,
                                unique: false,
                                type: 'text'
                            }
                            $scope.fieldOptions = '';
                        }).catch(function(err){
                            //alert('cannot add field');
                            FlashService.Error($rootScope.selectedLanguage.fields.flashMessages.notAdded);
                        });
                    }
                    else{
                        ModulesService.updateModuleField(forSave).then(function(){
                            //alert('field updated');
                            FlashService.Success($rootScope.selectedLanguage.fields.flashMessages.updated);
                            $scope.getModuleByName();
                            $scope.newField = {
                                name: '',
                                required: false,
                                unique: false,
                                type: 'text'
                            }
                            $scope.fieldOptions = '';
                        }).catch(function(err){
                            //alert('cannot update field');
                            FlashService.Error($rootScope.selectedLanguage.fields.flashMessages.notUpdated);
                        });
                    }
                }

                
            }
            else{
                FlashService.Error($rootScope.selectedLanguage.fields.flashMessages.exists);
                //alert('field already exists');
            }
        }

        $scope.deleteField = function(fieldObject){
            ModulesService.deleteModuleField($scope.module.name, fieldObject.id).then(function(){
                //alert('field deleted');
                FlashService.Success($rootScope.selectedLanguage.fields.flashMessages.deleted);
                $scope.getModuleByName();
            }).catch(function(err){
                //alert('cannot delete field');
                FlashService.Error($rootScope.selectedLanguage.fields.flashMessages.notDeleted);
            });
        }

        /* $scope.deleteModule = function(aModule){
            if(aModule.name == 'users'){
                alert('cannot delete "users" collection')
            }
            else{
                if(confirm('Are you sure you want to delete ' + aModule.name + 
                '?\nAll documents in this collection will also be deleted.')){
                    ModulesService.deleteModule(aModule._id, aModule.name).then(function(){
                        alert('module deleted');
                    }).catch(function(err){
                        alert('oh wow did not delete');
                    });
                }
            }
        } */

        //function for sorting  fields
		$scope.sortableOptions = {
			axis: 'y',
            update: function(e, ui) {				
				ModulesService.updateFieldArray({moduleName: $scope.module.name, fieldArray: $scope.module.fields}).then(function(){
                    }).catch(function(){
                    });
            },
            
        };
    }
})();