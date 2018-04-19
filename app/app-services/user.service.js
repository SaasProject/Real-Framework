(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('UserService', Service);
 
    function Service($http, $q) {
        var service = {};
 
        service.GetCurrent = GetCurrent;
        service.GetAdmin = GetAdmin;
        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.Insert = Insert;
        service.saveLanguage = saveLanguage;
 
        return service;
        
        function saveLanguage(option, user){
            user.option = option;
            return $http.put('/api/users/saveLanguage/' + user._id, user).then(handleSuccess, handleError);
        }
        
        /*
            Function name: User App Service Get current user
            Author(s): Flamiano, Glenn
            Date Modified: 2018/03/01
            Description: Retrieves the user info of the currently logged in user
            Parameter(s): none
            Return: none
        */
        function GetCurrent() {
            return $http.get('/api/users/current').then(handleSuccess, handleError);
        }

        /*
            Function name: User App Service Get Admin
            Author(s): Flamiano, Glenn
            Date Modified: 2018/03/01
            Description: Retrieves the role of the user if it is Admin or User
            Parameter(s): none
            Return: none
        */
        function GetAdmin() {
            return $http.get('/api/users/isAdmin').then(handleSuccess, handleError);
        }
        
        /*
            Function name: User App Service Get Admin
            Author(s): Flamiano, Glenn
            Date Modified: 2018/03/01
            Description: Retrieves all the users
            Parameter(s): none
            Return: none
        */
        function GetAll() {
            return $http.get('/api/users/all').then(handleSuccess, handleError);
        }
        
        /*
            Function name: User App Service Get By Id
            Author(s): Flamiano, Glenn
            Date Modified: 2018/03/01
            Description: Retrieves one user by _id
            Parameter(s): none
            Return: none
        */
        function GetById(_id) {
            return $http.get('/api/users/' + _id).then(handleSuccess, handleError);
        }
 
        function GetByUsername(username) {
            return $http.get('/api/users/' + username).then(handleSuccess, handleError);
        }
 
        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError);
        }
 
        function Update(user) {
            return $http.put('/api/users/' + user._id, user).then(handleSuccess, handleError);
        }
 
        function Delete(_id) {
            return $http.delete('/api/users/' + _id).then(handleSuccess, handleError);
        }

        function Insert(user){
            return $http.post('/api/users/addUser', user).then(handleSuccess, handleError);
        }
 
        // private functions
 
        function handleSuccess(res) {
            return res.data;
        }
 
        function handleError(res) {
            return $q.reject(res.data);
        }
    }
 
})();