(function() {
    'use strict';

    angular
        .module('app.application.appsettings.keys')
        .controller('KeysController', function($scope, $state, $stateParams, msModeService, msUserService,
            msApplicationService, msSchemasService) {

            if (!msUserService.getAccessToken()) {
                $state.go('app.pages_auth_login');
            }

            var appName = $stateParams.appName;
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
                });
            }

            $scope.showMasterKey = function() {
                msApplicationService.getMasterkey($scope.appId, function(error, result) {
                    $scope.masterKey = result.data.data.masterKey;
                });
            }

        });
})();
