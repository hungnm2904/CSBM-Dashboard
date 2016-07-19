(function() {
    'use strict';

    angular
        .module('app.application.classes', [])
        .directive('autofocus', autofocus)
        .config(config)
        .run(run);

    /** @ngInject */
    function config($stateProvider, $urlRouterProvider, msApiProvider) {
        $urlRouterProvider.when('/apps/:appName/classes/:className', ['$state', '$stateParams', '$location', 'msModeService',
            function($state, $stateParams, $location, msModeService) {
                if (!$state.current.name) {
                    var path = $location.path().split('/');
                    var appName = path[2];
                    var className = path[4];
                    msModeService.renderApplicationNavigations(null, appName, className);
                }
            }
        ]);
    };

    function autofocus($timeout) {
        return {
            restrict: 'A',
            link: function($scope, $element) {
                $timeout(function() {
                    $element[0].focus();
                });
            }
        }
    };

    function run($rootScope) {};

})();
