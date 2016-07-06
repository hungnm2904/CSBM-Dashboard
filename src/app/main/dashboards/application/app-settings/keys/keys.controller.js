(function() {
    'use strict';

    angular
        .module('app.dashboards.application.appsettings.keys')
        .controller('KeysController', function($scope, $stateParams, msModeService,
            msApplicationService, msUserService) {

            if (!msUserService.getAccessToken()) {
                $state.go('app.pages_auth_login');
            }

            msModeService.setToApplicationMode();

            var appId = $stateParams.appId;
            $scope.appId = appId;

            $scope.showMasterKey = function() {
                msApplicationService.getMasterkey(appId, function(error, result) {
                    $scope.masterKey = result.data.data.masterKey;
                });
            }

        });
})();
