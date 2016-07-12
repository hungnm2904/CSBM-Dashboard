(function() {
    'use strict';

    angular
        .module('app.application.appsettings.notifications', [])
        .config(config);
    // .run(run);

    function config($stateProvider) {
        $stateProvider.state('app.application_appsettings_notifications', {
            url: '/dashboard-application/:appId/app-settings/push-notifications',
            views: {
                'content@app': {
                    templateUrl: 'app/main/dashboard/application/app-settings/push-notifications/notifications.html',
                    controller: 'NotificationsController as vm'
                }
            }
        });
    };

})();
