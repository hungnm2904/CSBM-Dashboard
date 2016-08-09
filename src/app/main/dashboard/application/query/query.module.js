(function() {
    'use strict';

    angular
        .module('app.application.query', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {
        $stateProvider.state('app.application_query', {
            url: '/:mode/:appName/query',
            views: {
                'content@app': {
                    templateUrl: 'app/main/dashboard/application/query/query.html',
                    controller: 'QueryController as vm'
                }
            }
        });
    };

})();
