(function() {
    'use strict';

    angular
        .module('app.application.appsettings.notifications')
        .controller('NotificationsController', function($scope, $stateParams, $http, msUserService,
            msConfigService, msSchemasService, msApplicationService) {

            if (!msUserService.getAccessToken()) {
                $state.go('app.pages_auth_login');
            }

            var appName = $stateParams.appName;
            $scope.senderId = undefined;
            $scope.apiKey = undefined;
            $scope.appId = msSchemasService.getAppId();
            if (!$scope.appId) {
                msApplicationService.getAppId(appName, function(error, results) {
                    if (error) {
                        if (error.status === 401) {
                            return $state.go('app.pages_auth_login');
                        }

                        return alert(error.statusText);
                    }

                    $scope.appId = results.appId;
                    msApplicationService.getById($scope.appId, function(error, results) {
                        $scope.senderId = results.push.android.senderId;
                        $scope.apiKey = results.push.android.apiKey;
                    });
                });
            } else {
                msApplicationService.getById($scope.appId, function(error, results) {
                    $scope.senderId = results.push.android.senderId;
                    $scope.apiKey = results.push.android.apiKey;
                });
            }
            var _domain = (msConfigService.getConfig()).domain;

            $scope.senderId;
            $scope.apiKey;

            $scope.enablePush = function() {
                var accessToken = msUserService.getAccessToken();
                $http({
                    method: 'POST',
                    url: _domain + '/pushConfig',
                    headers: {
                        'X-CSBM-Application-Id': $scope.appId,
                        'Authorization': 'Bearer ' + accessToken
                    },
                    data: {
                        senderId: $scope.senderId,
                        apiKey: $scope.apiKey
                    }
                }).then(function(response) {

                }, function(response) {
                    alert(response.statusText);
                });
            };
        });
})();
