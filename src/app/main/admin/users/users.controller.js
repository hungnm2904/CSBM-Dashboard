(function() {
    'use strict';

    angular
        .module('app.admin.users')
        .controller('UsersController', function($scope, $http, $cookies, $window, $state, msUserService) {
            if (!msUserService.getAccessToken()) {
                $state.go('app.pages_auth_login');
            }

            $scope.dtOptions = {
                dom: '<"top"f>rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
                pagingType: 'simple',
                autoWidth: false,
                responsive: true
            };

            $scope.headers = { "objectId": "aaaabbbbb", "createdAt": "dsadasdd", "updatedAt": "dsadasdd", "action": "true" };
            $scope.documents = [{
                "objectId": "1MMYl9Cstp",
                "createdAt": "2016-08-06T13:35:12.497Z",
                "updatedAt": "2016-08-06T13:35:12.497Z",
                "active": true
            }, {
                "objectId": "2MMYl9Cstp",
                "createdAt": "2016-08-06T13:35:12.497Z",
                "updatedAt": "2016-08-06T13:35:12.497Z",
                "active": false
            }, {
                "objectId": "3MMYl9Cstp",
                "createdAt": "2016-08-06T13:35:12.497Z",
                "updatedAt": "2016-08-06T13:35:12.497Z",
                "active": true
            }];

            $scope.onChange = function(objectId, active) {
                console.log(objectId + ", " + active);
            };
        });
})();
