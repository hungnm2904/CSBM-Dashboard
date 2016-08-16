(function() {
    'use strict';

    angular
        .module('app.application.push')
        .controller('PushController', function($scope, $state, $stateParams, msUserService) {

            if (!msUserService.getAccessToken()) {
                $state.go('app.pages_auth_login');
            }

        });
})();
