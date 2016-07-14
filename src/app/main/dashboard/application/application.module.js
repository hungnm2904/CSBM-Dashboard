(function() {
    'use strict';

    angular
        .module('app.application', [
            'app.application.query',
            'app.application.classes',
            'app.application.appsettings.general',
            'app.application.appsettings.keys',
            'app.application.appsettings.notifications'
        ])
        .config(config)
        .run(run);

    /** @ngInject */
    function config($stateProvider, msNavigationServiceProvider, msModeServiceProvider) {};

    function run($rootScope, $state, $stateParams, msSchemasService, msNavigationService,
        msModeService, msApplicationService, msDialogService) {
        // console.log($stateParams);

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            var toAppName = toParams.appName;
            if (toAppName) {
                var fromAppName = fromParams.appName;
                if (toAppName != fromAppName) {
                    msNavigationService.deleteItem('application');

                    msApplicationService.getAppId(toAppName, function(error, results) {
                        if (error) {
                            if (error.status === 401) {
                                return $state.go('app.pages_auth_login');
                            }

                            return alert(error.statusText);
                        }

                        var appId = results.appId;
                        // msSchemasService.setAppId(appId);
                        msModeService.renderApplicationModeNavigations(appId, toAppName);
                    });
                }

                msModeService.setToApplicationMode();
            }
        });

        $rootScope.$on('schemas-changed', function(event, args) {
            var appId = args.appId;
            var appName = args.appName;
            msModeService.renderApplicationModeNavigations(appId, appName);
        });

        // $rootScope.$on('schemas-changed', function(event, args) {
        //     var appId = args.appId;
        //     var className = args.className;
        //     msApplicationService.getAppName(appId, function(error, results) {
        //         var appName = results.data.data.appName;

        //         msNavigationService.saveItem('application', {
        //             title: appName,
        //             group: true,
        //             weight: 1,
        //             hidden: function() {
        //                 return !msModeService.isApplicationMode();
        //             }
        //         });

        //         msNavigationService.saveItem('application.appsettings', {
        //             title: 'Application Settings',
        //             icon: 'icon-key'
        //         });

        //         msNavigationService.saveItem('application.appsettings.general', {
        //             title: 'General',
        //             state: 'app.application_appsettings_general ',
        //             stateParams: { 'appId': appId }
        //         });                

        //         msNavigationService.saveItem('application.appsettings.keys', {
        //             title: 'Keys',
        //             state: 'app.application_appsettings_keys ',
        //             stateParams: { 'appId': appId }
        //         });

        //         msNavigationService.saveItem('application.appsettings.notifications', {
        //             title: 'Push Notifications',
        //             state: 'app.application_appsettings_notifications',
        //             stateParams: { 'appId': appId }
        //         });

        //         msNavigationService.saveItem('application.classes', {
        //             title: 'Classes',
        //             icon: 'icon-library-plus',
        //             group: true,
        //             button: {
        //                 title: 'Create a class',
        //                 function: function(ev) {
        //                     msDialogService.showDialog(ev, 'app/core/services/dialogs/addClassDialog.html');
        //                 }
        //             }
        //         });

        //         var schemas = msSchemasService.getSchemas(appId, className, function(error, results) {
        //             if (error) {
        //                 if (error.status === 401) {
        //                     return $state.go('app.pages_auth_login', { error: error });
        //                 }

        //                 return alert(error.statusText);
        //             }

        //             var schemas = results;
        //             for (var i = 0; i < schemas.length; i++) {
        //                 var schema = schemas[i];

        //                 // Create navigation for schema
        //                 msNavigationService.saveItem('application.classes.' + schema.className, {
        //                     title: schema.className,
        //                     state: 'app.application_classes',
        //                     stateParams: { 'appId': appId, 'className': schema.className, 'objectId': null }
        //                 });
        //             }
        //         });
        //     });
        // });
    };
})();
