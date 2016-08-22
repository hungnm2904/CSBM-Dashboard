(function() {
    'use strict';

    angular
        .module('app.admin.applications')
        .controller('ManageApplicationsController', function($scope, $http, $cookies, $window, $state,
            msUserService, msConfigService, msApplicationService) {

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
            $scope.headers = ['_id', 'name', 'userId', 'created_at', 'updated_at', 'status'];

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
                }, function(response) {
                    alert(response.statusText);
                });
            };
            getAllApplications();

            $scope.onChange = function(appId, appName, active) {
                var data = {
                    'status': active
                }

                msApplicationService.update(appId, appName, data, function(error, results) {
                    if (error) {
                        if (error.status === 401) {
                            return $state.go('app.pages_auth_login');
                        }

                        return alert(error.statusText);
                    }
                });
            };
        });
})();
