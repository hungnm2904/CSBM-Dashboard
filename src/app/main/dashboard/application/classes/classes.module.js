(function() {
    'use strict';

    angular
        .module('app.application.classes', [])
        .directive('autofocus', autofocus)
        .config(config)
        .run(run);

    /** @ngInject */
    function config() {};

    function autofocus($timeout) {
        return {
            restrict: 'A',
            link: function($scope, $element) {
                $timeout(function() {
                    $element[0].focus();
                    $element[0].select();
                });
            }
        }
    };

    function run($rootScope) {};

})();
