(function() {
    'use strict';

    angular
        .module('app.dashboards.application.appsettings.keys', [])
        .config(config);
        // .run(run);

    /** @ngInject */
    function config($stateProvider) {
        $stateProvider.state('app.dashboards_application_appsettings_keys', {
            url: '/dashboards-application/:appId/app-settings/keys',
            views: {
                'content@app': {
                    templateUrl: 'app/main/dashboards/application/app-settings/keys/keys.html',
                    controller: 'KeysController as vm'
                }
            }
        });
    };

})();
