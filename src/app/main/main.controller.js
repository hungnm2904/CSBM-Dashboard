(function ()
{
    'use strict';

    angular
        .module('masamune')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController($scope, $state, $rootScope)
    {
        // Data
        $scope.gotoDashboard = function() {
            $state.go('app.managements_applications');
        }
        //////////

        // Remove the splash screen
        $scope.$on('$viewContentAnimationEnded', function (event)
        {
            if ( event.targetScope.$id === $scope.$id )
            {
                $rootScope.$broadcast('msSplashScreen::remove');
            }
        });
    }
})();