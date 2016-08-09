(function() {
    'use strict';

    angular
        .module('app.admin', [
            'app.admin.applications',
            'app.admin.users'
        ])
        .config(config)
        .run(run);

    function config() {};

    function run($rootScope, msModeService) {
        // $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        //     var appId = toParams.appId;
        //     if (toState.name.includes('applications')) {
        //         msModeService.renderManagementNavigations();
        //     }
        // });
    };
})();
