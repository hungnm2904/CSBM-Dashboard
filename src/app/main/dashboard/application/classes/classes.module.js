(function() {
    'use strict';

    angular
        .module('app.application.classes', [])
        .directive('autofocus', autofocus)
        .config(config);
    // .run(run);

    /** @ngInject */
    function config($stateProvider, msApiProvider) {

        $stateProvider.state('app.application_classes', {
            url: '/apps/:appName/classes/:className',
            params: {
                appId: null,
                objectId: null
            },
            views: {
                'content@app': {
                    templateUrl: 'app/main/dashboard/application/classes/classes.html',
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
