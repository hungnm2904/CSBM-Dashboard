(function() {
    'use strict';

    angular
        .module('app.application.appsettings.keys', [])
        .config(config);
        // .run(run);

    /** @ngInject */
    function config($stateProvider) {
        $stateProvider.state('app.application_appsettings_keys', {
            url: '/:mode/:appName/settings/keys',
            views: {
                'content@app': {
                    templateUrl: 'app/main/dashboard/application/app-settings/keys/keys.html',
                    controller: 'KeysController as vm'
                }
            }
        });
    };

})();
