(function() {
    'use strict';

    angular
        .module('app.application.diagram', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {
        $stateProvider.state('app.application_diagram', {
            url: '/apps/:appName/diagram',
            views: {
                'content@app': {
                    templateUrl: 'app/main/dashboard/application/diagram/diagram.html',
                    controller: 'DiagramController as vm'
                }
            }
        });
    };

})();
