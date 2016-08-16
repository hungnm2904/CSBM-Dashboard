(function() {
    'use strict';

    angular
        .module('app.application.push', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {
        $stateProvider.state('app.application_push', {
            url: '/:mode/:appName/push',
            views: {
                'content@app': {
                    templateUrl: 'app/main/dashboard/application/push/push.html',
                    controller: 'PushController as vm'
                }
            }
        });
    };

})();
