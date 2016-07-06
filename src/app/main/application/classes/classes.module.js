(function() {
    'use strict';

    angular
        .module('app.application.classes', ['ui.bootstrap'])
        .directive('autofocus', autofocus)
        .config(config);
    // .run(run);

    /** @ngInject */
    function config($stateProvider, msApiProvider) {

        $stateProvider.state('app.application_classes', {
            url: '/application/:appId/classes/:index',
            views: {
                'content@app': {
                    templateUrl: 'app/main/application/classes/classes.html',
                    controller: 'ClassesController as vm'
                }
            }
        });
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

})();
