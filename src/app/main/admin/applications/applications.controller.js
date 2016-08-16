(function() {
    'use strict';

    angular
        .module('app.admin.applications')
        .controller('ManageApplicationsController', function($scope, $http, $cookies, $window, $state,
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
            $scope.applications = [];
            $scope.headers = ['_id', 'name', 'userId', 'created_at', 'updated_at'];

            var getAllApplications = function() {
                var accessToken = msUserService.getAccessToken();
                $http({
                    method: 'GET',
                    url: _domain + '/applications/all',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                }).then(function(response) {
                    $scope.applications = angular.copy(response.data);

                    console.log($scope.applications);

                }, function(response) {
                    alert(response.statusText);
                });
            };
            getAllApplications();

            var get

            $scope.onChange = function(objectId, active) {
                console.log(objectId + ", " + active);
            };
        });
})();
