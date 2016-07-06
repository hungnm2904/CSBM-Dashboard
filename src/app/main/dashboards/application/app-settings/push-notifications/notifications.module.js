(function() {
    'use strict';

    angular
        .module('app.dashboards.application.appsettings.notifications', [])
        .config(config);
    // .run(run);

    function config($stateProvider) {
        $stateProvider.state('app.dashboards_application_appsettings_notifications', {
            url: '/dashboards-application/:appId/app-settings/push-notifications',
            views: {
                'content@app': {
                    templateUrl: 'app/main/dashboards/application/app-settings/push-notifications/notifications.html',
                    controller: 'NotificationsController as vm'
                }
            }
        });
    };

})();
