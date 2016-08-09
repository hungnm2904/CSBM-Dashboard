(function() {
    'use strict';

    angular
        .module('app.application.appsettings.notifications')
        .controller('NotificationsController', function($scope, $stateParams, $http, msUserService,
            msModeService, msConfigService) {

            if (!msUserService.getAccessToken()) {
                $state.go('app.pages_auth_login');
            }

            var appId = $stateParams.appId;
            var _domain = (msConfigService.getConfig()).domain;

            $scope.senderId;
            $scope.apiKey;

            $scope.enablePush = function() {
                var accessToken = msUserService.getAccessToken();
                $http({
                    method: 'POST',
                    url: _domain + '/pushConfig',
                    headers: {
                        'X-CSBM-Application-Id': appId,
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
