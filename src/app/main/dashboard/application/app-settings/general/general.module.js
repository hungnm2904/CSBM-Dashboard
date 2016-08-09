(function() {
    'use strict';

    angular
        .module('app.application.appsettings.general', [])
        .config(config);
        // .run(run);

    /** @ngInject */
    function config($stateProvider) {
        $stateProvider.state('app.application_appsettings_general', {
            url: '/:mode/:appName/settings/general',
            views: {
                'content@app': {
                    templateUrl: 'app/main/dashboard/application/app-settings/general/general.html',
                    controller: 'GeneralController as vm'
                }
            }
        });
    };

})();
