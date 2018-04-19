/*
    Name: Home Controller
    Date Created: ??/??/2018
    Author(s):
    
 */
(function () {
    'use strict';
 
    angular
        .module('app', ['ui.router', 'ui.sortable', 'ngSanitize', 'ngCsv', 'ui.bootstrap', 'btford.socket-io'])
        .config(config)
        .run(run);
 
    /*
        Function name: config function
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: Declare the angular configuration (routes, injectors, etc)
        Parameter(s): $stateProvider, $urlRouteProvider, $httpProvider (dependencies)
        Return: none
    */
    function config($stateProvider, $urlRouterProvider, $httpProvider) {
        // default route
        $urlRouterProvider.otherwise("/");
 
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'home/index.html',
                controller: 'Home.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('manageUsers', {
                url: '/manageUsers',
                templateUrl: 'manageUsers/index.html',
                controller: 'ManageUsers.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'manageUsers' }
            })
            .state('account', {
                url: '/account',
                templateUrl: 'account/index.html',
                controller: 'Account.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'account' }
            })            
            .state('fields', {
                url: '/fields',
                templateUrl: 'fields/index.html',
                controller: 'Fields.IndexController',
                data: { activeTab: 'fields' }
            })
            .state('assets', {
                url: '/assets',
                templateUrl: 'asset/index.html',
                controller: 'Asset.IndexController',
                data: { activeTab: 'assets' }
            })
            .state('warehouses', {
                url: '/warehouses',
                templateUrl: 'warehouse/index.html',
                controller: 'Warehouse.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'warehouses' }
            })
            .state('devices', {
                url: '/devices',
                templateUrl: 'manageDevices/index.html',
                controller: 'Device.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'devices' }
            });


        // added by jeremy
        // this is to intercept all errors. when 401 is received, must redirect to login
        $httpProvider.interceptors.push(function($q, $window, $location){
            return {
                'responseError': function(rejection){
                    var defer = $q.defer();

                    //401 is unauthorized error, meaning token has expired 
                    if(rejection.status == 401){
                        //this is done to imitate the returnUrl in app.controller.js 
                        //when accessing pages that requires login

                        //pathname only shows /app/ which is wrong
                        //so get fullpath first then get substring starting from pathname
                        //var fullpath = $window.location.href;
                        //var returnUrl = fullpath.substring(fullpath.indexOf($window.location.pathname));
                        //alert('error on responseError');

                        //add expired query to explicitly state that the session has expired and not just trying to access via typing the address
                        //$window.location.href = '/login?returnUrl=' + encodeURIComponent(returnUrl) + '&expired=true';
                        location.reload();
                    }

                    defer.reject(rejection);

                    return defer.promise;
                }
            };
        });
    }
 
    /*
        Function name: run function
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: Executes when angular page is first loaded
        Parameter(s): $http, $rootScope, $window, UserService, $state (dependencies)
        Return: none
    */
    function run($http, $rootScope, $window, UserService, UploadService, LanguageService, $state, socket) {
        //initialize
        $rootScope.user = {};
        $rootScope.selectedLanguage = {};
        $rootScope.defaultLanguage = {};
        $rootScope.greet = false;
		$rootScope.changePasswordModal = false;

        // add JWT token as default auth header
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;

        //added by glenn
        //get current user and set details to rootScope
        $http.get('/api/users/isAdmin').success(function(response){
            //response is true if user is admin from api/users.controller.js
            //console.log(response);
            if(response){

                // Determine if user is admin
                if(true){
                    // User can manage users
                    $rootScope.isAdmin = true;
                } else {

                    //User cannot manage users
                    $rootScope.isAdmin = false;
                }
            }
            else{
                return false;
            }
        });
 
        //added by jeremy
        // update active tab on state change
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            //console.log($rootScope.isAdmin);
            //console.log(toState);
            //restrict 'Users' when accessing states other than the specified and redirect to login page
            $http.get('/api/users/isAdmin').then(function(response){
                //response is true if user is admin from api/users.controller.js
                $rootScope.isAdmin = response.data;
                //console.log($rootScope.isAdmin);

                //need to place code here. putting it outside will not work
                if(!$rootScope.isAdmin && (toState.name != 'assets' && toState.name != 'home' && toState.name != 'account')){
                    event.preventDefault();
                    //alert('Unauthorized');
                    $state.transitionTo('home');
                }
                
            });


            //redirect to manageUsers when /perModule/users
            if(toState.name == 'perModule' && toParams.moduleName == 'users'){
                $state.transitionTo('manageUsers');
            }

            //get token from server every route change to determine if session in server is still alive
            $http.get('/app/token').then(function(res){
                //console.log(res);
                //if server restarts while app is in browser, clicking links will render the login page
                //inside the index.html
                //so check the res.data for '<html>'. if found, load whole login page
                if(res.data.indexOf('<html>') != -1){
                        event.preventDefault();
                        //var fullpath = $window.location.href;
                        //var returnUrl = fullpath.substring(fullpath.indexOf($window.location.pathname));
                        //alert('error on @statechange');

                        //add expired query to explicitly state that the session has expired and not just trying to access via typing the address
                        //$window.location.href = '/login?returnUrl=' + encodeURIComponent(returnUrl) + '&expired=true';
                        location.reload();
                }
            });
            
            //change active tab for the nav bar
            $rootScope.activeTab = toState.data.activeTab;
        });
            //get default language
            LanguageService.getDefaultLanguage()
                .then(function(res) {
                    //console.log(res);
                    $rootScope.defaultLanguage = res;
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        //execute when loaded
        getUserInfos();
        

        $rootScope.changeLanguage = function(option) {
            changeLang(option);
            socket.emit('languageChange', option);
        }

        function changeLang(option){
            
            //save selected language to database
            UserService.saveLanguage(option, $rootScope.user);
            LanguageService.getSpecificLanguage(option)
                .then(function(res){
                    $rootScope.selectedLanguage = res[Object.keys(res)[0]];
                    //console.log($rootScope.selectedLanguage);
                    $rootScope.hiUser = $rootScope.selectedLanguage.commons.hiUser1+$rootScope.user.firstName
                    +$rootScope.selectedLanguage.commons.hiUser2;
                    $rootScope.dropLangSel = Object.keys(res)[0];
                })
                .catch(function (error) {
                    FlashService.Error(error);
            });
            
        }

        socket.on('languageChange', function(option){
            changeLang(option);
        });

        $rootScope.changeDefaultLanguage = function(option) {
            //save selected default language to database
            LanguageService.saveDefaultLanguage($rootScope.user, option);
        }

        /*
            Function name: getUserInfos
            Author(s): Omugtong, Jano
            Date Modified: 02-06-18
            Description: get first name and last name of user for default avatar
                        get id to generate a unique background color for avatar
                        and also assign firstname in rootscope.
            Parameter(s): none
            Return: none
        */
        function getUserInfos() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                var str = user._id;
                $rootScope.user = user;
                $rootScope.fName = user.firstName;
                $rootScope.dropLangSel = '';
                $rootScope.dropDefLangSel = '';

                LanguageService.getSpecificLanguage($rootScope.user.setLanguage)
                .then(function(res) {
                    $rootScope.selectedLanguage = res[Object.keys(res)[0]];
                    $rootScope.hiUser = $rootScope.selectedLanguage.commons.hiUser1+user.firstName
                        +$rootScope.selectedLanguage.commons.hiUser2;
                    $rootScope.dropLangSel = Object.keys(res)[0];
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });





                if (user.firstName == null){
                    $rootScope.initials = "new";
                }
                else{
                    var initials = user.firstName.charAt(0) + user.lastName.charAt(0);
                    $rootScope.initials = initials.toUpperCase();

                    //get user profile pic
                    var profilePicPath = '/' + user.fileUrl;
                    //$rootScope.profilePic = '';
                    var pathUsed = 'profile_pictures';
                    UploadService.readFile(pathUsed+profilePicPath).then(function(res) {
                        if(res == 'false'){
                            $rootScope.profilePic = '';
                        } else if(res == 'true'){
                            $rootScope.profilePic = '/' + user.fileUrl;
                        }
                    })
                    .catch(function (error) {
                    });

                    if(user.fileUrl == undefined || user.fileUrl == ''){
                        $rootScope.profilePic = '';
                    }
                }

                $rootScope.bgColor = {"background" : stringToColour(str)} ;

                function stringToColour(str) {
                    var hash = 0;
                    for (var i = 0; i < str.length; i++) {
                      hash = str.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    var colour = '#';
                    for (var i = 0; i < 3; i++) {
                      var value = (hash >> (i * 8)) & 0xFF;
                      colour += ('00' + value.toString(16)).substr(-2);
                    }
                    return colour;
                  }
            }).finally(function(){
                $rootScope.greet = true;
            });
        }
    }
 
    // manually bootstrap angular after the JWT token is retrieved from the server
    $(function () {
        // get JWT token from server
        $.get('/app/token', function (token) {
            //alert(token);
            if(token.indexOf('<html>') != -1){
                //if user logs out then presses the browser back button, 
                //  the response is the login page (login.ejs) (rendered under ui-view in index.html)
                //so check the response for '<html>'. if found, load whole login page
                //alert('error on $function');

                //window.location.href = '/login';
                location.reload();
            }
            else{
                window.jwtToken = token;
 
                angular.bootstrap(document, ['app']);
            }
        });
    });
})();