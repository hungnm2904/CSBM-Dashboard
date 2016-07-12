(function() {
    'use strict';

    angular
        .module('app.management.applications', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msApiProvider) {
        $stateProvider.state('app.management_applications', {
            url: '/dashboard/applications',
            views: {
                'content@app': {
                    templateUrl: 'app/main/dashboard/management/applications/applications.html',
                    controller: 'ApplicationsController as vm'
                }
            }
        });
    }

})();
