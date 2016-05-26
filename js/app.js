// yolo App - Ionic & Firebase
var firebaseUrl = "https://beanbag.firebaseio.com";
//test db https://reddel.firebaseio.com
//https://yolo-app.firebaseio.com
function onDeviceReady() {

    setTimeout(function() {

        navigator.splashscreen.hide();

    }, 3000);
    //geolocation callbacks
    var onSuccess = function(position) {     
            var location = {
                    'latitude': position.coords.latitude,
                    'longitude': position.coords.longitude
            }
        window.localStorage.setItem(location, JSON.stringify('location'));        
    };

    //onError Callback receives a PositionError object
    function onError(error) {
        switch(error.code){
            case error.TIMEOUT:
                alert('geolocation timed out.')
                break;
            case error.POSITION_UNAVAILABLE:
                alert('position unavailable');
                break;
            case error.PERMISSION_DENIED:
                alert('permission denied');
                break;
            default:
                alert('geolocation returned an unknown error ' +  error.code);
        }
       
    }
    navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        maximumAge: 300000,
        timeout: 300000
    });

    /*Fixes a change in phonegap that forces FB into offline mode when minimized*/
    var ref = new Firebase(firebaseUrl+'/users');

    document.addEventListener("resume", onResume, false);
    document.addEventListener("pause", onPause, false);

    function onPause(){
        Firebase.goOffline();
    } 

    function onResume(){
        Firebase.goOnline();
    } 

    angular.bootstrap(document, ["mychat"]);

     function contactSuccess(contacts) {
        console.log('Found ' + contacts.length + ' contacts.');
        
    };
    //
    function contactError(contactError) {
        alert('Error! '+contactError);
    };

    // find all contacts with 'me' in any name field
    var options      = new ContactFindOptions();
        options.filter   = "";
        options.multiple = false;
        //options.desiredFields = [navigator.contacts.fieldType.id];
        var fields       = ["name","displayName","emails"];
        navigator.contacts.find(fields, contactSuccess, contactError, options);

}
//console.log("binding device ready");
// Registering onDeviceReady callback with deviceready event
document.addEventListener("deviceready", onDeviceReady, false);

angular.module('mychat', ['ionic', 'ngIOS9UIWebViewPatch', 'firebase', 'angularMoment', 'mychat.controllers', 'mychat.services', 'mychat.directives', 'mychat.autocomplete', 'mychat.filters'])

    .run(function ($ionicPlatform, $rootScope, $location, Auth, $ionicLoading, $window, $state, $timeout, $ionicPopup, ConnectionCheck, Users) {

    $ionicPlatform.ready(function () {

        ConnectionCheck.netCallback(function(state){
            if(state){
                alertPopup = $ionicPopup.alert({
                        title: 'Warning!',
                        template: state
                });
                $timeout(function(){
                    alertPopup.close();
                }, 2000);
            }
        });
        
        /*Google keys
         * key: AIzaSyAbXzuAUk1EICCdfpZhoA6-TleQrPWxJuI
         * Project Number: open-circles-1064/346007849782
         */
            
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        // To Resolve Bug
        ionic.Platform.fullScreen();

        $rootScope.firebaseUrl = firebaseUrl;
        $rootScope.displayName = null;
        $rootScope.email       = null;
        $rootScope.schoolID    = null;
        $rootScope.group       = null;
        $rootScope.gender      = null;
        $rootScope.userID      = null;
        $rootScope.displayName = null;
        $rootScope.superuser   = null;

        Auth.$onAuth(function (authData) {
            $ionicLoading.hide();
            if (!authData) {
                $location.path('/login');
            }else{
                $timeout(function () {
                    $state.go('menu.tab.events');
                },10);
            }   
        });
        //params: event, toState, toParams, fromState, fromParams
        $rootScope.$on("$stateChangeStart", function (){
            $ionicLoading.hide();
        });
        $rootScope.$on("$stateChangeError", function (error) {
            // We can catch the error thrown when the $requireAuth promise is rejected
            // and redirect the user back to the home page
            if (error === "AUTH_REQUIRED") {
                $location.path("/login");
            }
        });
    });
})

    .config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider',

function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    console.log("setting config");
    $ionicConfigProvider.tabs.position('top');
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // State to represent Login View
    .state('login', {
        url: "/login",
        templateUrl: "templates/login.html",
        controller: 'LoginCtrl',
        resolve: {
            // controller will not be loaded until $waitForAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",

            function (Auth) {
                // $waitForAuth returns a promise so the resolve waits for it to complete
                return Auth.$waitForAuth();
            }]
        }
    })
        .state('menu', {
        url: "/menu",
        abstract: true,
        templateUrl: "templates/menu.html",
        resolve: {
            // controller will not be loaded until $requireAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",

            function (Auth) {
                // $requireAuth returns a promise so the resolve waits for it to complete
                // If the promise is rejected, it will throw a $stateChangeError (see above)
                return Auth.$requireAuth();
            }]
        }
    })
    // setup an abstract state for the tabs directive
    .state('menu.tab', {
        url: "/tab",
        abstract: true,
        views: {
            'tabs': {
                templateUrl: "templates/tabs.html",
                controller: 'TabCtrl'
            }
        }
    })
        .state('menu.tab.ask', {
        url: '/ask',
        views: {
            'tab-ask': {
                templateUrl: 'templates/askQuestion.html',
                controller: 'AskCtrl'
            }
        }
    })
        .state('menu.tab.events', {
        url: '/studentrooms',
        views: {
            'tab-student': {
                templateUrl: 'templates/tab-rooms-student.html',
                controller: 'EventsCtrl'
            }
        }
    })
        .state('menu.tab.conversations', {
        url: '/conversations',
        views: {
            'tab-converse': {
                templateUrl: 'templates/tab-student-convers.html',
                controller: 'ConversationsCtrl'
            }
        }
    })
        .state('menu.tab.settingsMentor', {
        url: '/settingsMentor',
        views: {
            'tab-settingsMentor': {
                templateUrl: 'templates/tab-groups.html',
                controller: 'SettingsCtrlMentor'
            }
        }
    })
        .state('menu.tab.chat', {
        url: '/chat/:publicQuestionKey/:groupName/:question/:group/:displayName/:wrap/:avatar/:creatorEmail',
        cache: false,
        views: {
            'tab-chat': {
                templateUrl: 'templates/tab-chat.html',
                controller: 'PublicChatCtrl'
            }
        }
    })
        .state('menu.tab.privatechat', {
        url: '/chat/:publicQuestionKey/:groupName/:question/:group/:wrap/:avatar/:selfKey',
        cache: false,
        views: {
            'tab-privatechat': {
                templateUrl: 'templates/tab-chat.html',
                controller: 'PrivateChatCtrl'
            }
        }
    });
    //PublicChatCtrl
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

}]);