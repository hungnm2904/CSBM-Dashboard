(function() {
    'use strict';

    angular
        .module('app.management', [
            'app.management.applications',
            'app.management.users'
        ])
        .config(config)
        .run(run);

    function config(msNavigationServiceProvider, msModeServiceProvider) {
        msNavigationServiceProvider.saveItem('management', {
            title: 'MANAGEMENT',
            group: true,
            weight: 1,
            hidden: function() {
                return !msModeServiceProvider.isUserMode();
            }
        });

        msNavigationServiceProvider.saveItem('management.applications', {
            title: 'Applications',
            icon: 'icon-apps',
            state: 'app.management_applications'
        });

        // msNavigationServiceProvider.saveItem('management.users', {
        //     title: 'Users',
        //     // icon: 'icon-account-multiple',
        //     state: 'app.management_users'
        // });
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
