(function() {
    'use strict';

    angular
        .module('app.management', [
            'app.management.applications'
        ])
        .config(config)
        .run(run);

    function config() {};

    function run($rootScope, msModeService, msUserService) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            var appId = toParams.appId;
            var role = msUserService.getCurrentRole();
            if (toState.name.includes('applications') || toState.name.includes('users')) {
                if (role === 'Dev') {
                    msModeService.renderDevManagementNavigations();
                } else if (role === 'Admin') {
                    console.log('Render Admin Navigations');

                    msModeService.renderAdminManagementNavigations();
                }
            }
        });
    };
})();
