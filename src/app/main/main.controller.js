(function() {
    'use strict';

    angular
        .module('masamune')
        .controller('MainController', MainController);

    function MainController($scope, $state, $rootScope, msUserService) {

        $scope.gotoDashboard = function() {
            msUserService.getAccessToken() ? $state.go('app.management_applications') : $state.go('app.pages_auth_login');
        }

        $scope.$on('$viewContentAnimationEnded', function(event) {
            if (event.targetScope.$id === $scope.$id) {
                $rootScope.$broadcast('msSplashScreen::remove');
            }
        });
    }
})();
