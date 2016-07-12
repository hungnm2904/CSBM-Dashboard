(function() {
    'use strict';

    angular
        .module('app.application', [
            'app.application.classes',
            'app.application.appsettings.keys',
            'app.application.appsettings.notifications'
        ])
        .config(config)
        .run(run);

    /** @ngInject */
    function config($stateProvider, msNavigationServiceProvider, msModeServiceProvider) {
        // msNavigationServiceProvider.saveItem('application', {
        //     title: 'Application',
        //     group: true,
        //     weight: 2,
        //     // hidden: function() {
        //     //     return !msModeServiceProvider.isApplicationMode();
        //     // }
        // });

        // msNavigationServiceProvider.saveItem('application.appsettings', {
        //     title: 'Application Settings',
        //     icon: 'icon-key'
        // });

        // msNavigationServiceProvider.saveItem('application.appsettings.keys', {
        //     title: 'Keys',
        //     state: 'app.application_appsettings_keys ',
        //     // stateParams: { 'appId': appId }
        // });

        // msNavigationServiceProvider.saveItem('application.appsettings.notifications', {
        //     title: 'Push Notifications',
        //     state: 'app.application_appsettings_notifications',
        //     // stateParams: { 'appId': appId }
        // });
    };

    function run($rootScope, $state, $stateParams, msSchemasService, msNavigationService,
        msModeService, msApplicationService, msDialogService) {
        // console.log($stateParams);

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            var appId = toParams.appId;
            if (appId) {
                msModeService.setToApplicationMode();
                msSchemasService.getSchemas(appId, null, function(error, results) {
                    if (error) {
                        if (error.status === 401) {
                            return $state.go('app.pages_auth_login', { error: error });
                        }

                        return alert(error.statusText);
                    }
                });
            }
        });

        $rootScope.$on('schemas-changed', function(event, args) {

            var appId = args.appId;
            var className = args.className;
            msApplicationService.getAppName(appId, function(error, results) {
                var appName = results.data.data.appName;

                msNavigationService.saveItem('application', {
                    title: appName,
                    group: true,
                    weight: 1,
                    hidden: function() {
                        return !msModeService.isApplicationMode();
                    }
                });

                msNavigationService.saveItem('application.appsettings', {
                    title: 'Application Settings',
                    icon: 'icon-key'
                });

                msNavigationService.saveItem('application.appsettings.keys', {
                    title: 'Keys',
                    state: 'app.application_appsettings_keys ',
                    stateParams: { 'appId': appId }
                });

                msNavigationService.saveItem('application.appsettings.notifications', {
                    title: 'Push Notifications',
                    state: 'app.application_appsettings_notifications',
                    stateParams: { 'appId': appId }
                });

                msNavigationService.saveItem('application.classes', {
                    title: 'Classes',
                    icon: 'icon-library-plus',
                    group: true,
                    button: {
                        title: 'Create a class',
                        function: function(ev) {
                            msDialogService.showDialog(ev, 'app/core/services/dialogs/addClassDialog.html');
                        }
                    }
                });

                var schemas = msSchemasService.getSchemas(appId, className, function(error, results) {
                    if (error) {
                        if (error.status === 401) {
                            return $state.go('app.pages_auth_login', { error: error });
                        }

                        return alert(error.statusText);
                    }

                    var schemas = results;
                    for (var i = 0; i < schemas.length; i++) {
                        var schema = schemas[i];

                        // Create navigation for schema
                        msNavigationService.saveItem('application.classes.' + schema.className, {
                            title: schema.className,
                            state: 'app.application_classes',
                            stateParams: { 'appId': appId, 'className': schema.className, 'objectId': null }
                        });
                    }
                });
            });
        });
    };
})();
