(function() {
    'use strict';

    angular
        .module('app.dashboards.applications', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msApiProvider) {
        $stateProvider.state('app.dashboards_applications', {
            url: '/dashboards/applications',
            views: {
                'content@app': {
                    templateUrl: 'app/main/dashboards/applications/applications.html',
                    controller: 'ApplicationsController as vm'
                }
            }
        });
    }

})();
