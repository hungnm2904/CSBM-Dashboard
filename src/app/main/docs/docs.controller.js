(function() {
    'use strict';

    angular
        .module('app.docs')
        .controller('DocsController', DocsController);

    function DocsController($scope, $state, $rootScope) {
        $scope.$on('$viewContentAnimationEnded', function(event) {
            if (event.targetScope.$id === $scope.$id) {
                $rootScope.$broadcast('msSplashScreen::remove');
            }
        });

        $scope.goToGuideDoc = function(type) {
            $state.go('app.docs_' + type + '_guide_getting-started');
        };
    }
})();
