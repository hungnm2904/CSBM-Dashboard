(function() {
    'use strict';

    angular
        .module('app.admin.users')
        .controller('UsersController', function($scope, $http, $cookies, $window, $state,
            msUserService, msConfigService) {

            if (!msUserService.getAccessToken()) {
                $state.go('app.pages_auth_login');
            }

            var _domain = (msConfigService.getConfig()).domain;

            $scope.dtOptions = {
                dom: '<"top"f>rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
                pagingType: 'simple',
                autoWidth: false,
                responsive: true
            };

            $scope.users = [];
            $scope.headers = ['_id', 'email', 'created_at', 'updated_at', 'status'];

            var getAllUsers = function() {
                var accessToken = msUserService.getAccessToken();
                $http({
                    method: 'GET',
                    url: _domain + '/users/all',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                }).then(function(response) {
                    $scope.users = angular.copy(response.data.data.users);
                    $scope.users.forEach(function(user, index) {
                        if (user.role !== 'Disable') {
                            user.status = true;
                        }
                    });
                }, function(response) {
                    alert(response.statusText);
                });
            };
            getAllUsers();

            $scope.onChange = function(userId, status) {
                var accessToken = msUserService.getAccessToken();
                $http({
                    method: 'PUT',
                    url: _domain + '/users/status',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    },
                    data: {
                        'userId': userId,
                        'status': status
                    }
                }).then(function(response) {

                }, function(response) {
                    alert(response.statusText);
                });
            };
        });
})();
