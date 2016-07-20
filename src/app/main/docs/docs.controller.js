(function() {
    'use strict';

    angular
        .module('app.docs')
        .controller('DocsController', DocsController);

    function DocsController($scope, $state, $rootScope, $http, msConfigService) {
        $scope.$on('$viewContentAnimationEnded', function(event) {
            if (event.targetScope.$id === $scope.$id) {
                $rootScope.$broadcast('msSplashScreen::remove');
            }
        });

        var domain = (msConfigService.getConfig()).domain;

        $scope.goToGuideDoc = function(type) {
            $state.go('app.docs_' + type + '_guide_getting-started');
        };
    }
})();
