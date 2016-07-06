(function() {
    'use strict';

    angular
        .module('app.dashboards', [
            'app.dashboards.applications',
            'app.dashboards.application',
            'app.dashboards.users'
        ])
        .config(config)
        .run(run);

    function config(msNavigationServiceProvider, msModeServiceProvider) {
        msNavigationServiceProvider.saveItem('dashboards', {
            title: 'MANAGEMENT',
            group: true,
            weight: 1,
            hidden: function() {
                return !msModeServiceProvider.isUserMode();
            }
        });

        msNavigationServiceProvider.saveItem('dashboards.applications', {
            title: 'Applications',
            icon: 'icon-apps',
            state: 'app.dashboards_applications'
        });

        msNavigationServiceProvider.saveItem('dashboards.users', {
            title: 'Users',
            icon: 'icon-account-multiple',
            state: 'app.dashboards_users'
        });
    };

    function run($rootScope, msModeService) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            var appId = toParams.appId;
            if (!appId) {
                msModeService.setToUserMode();
            }
        });
    };
})();
