(function() {
    'use strict';

    angular
        .module('app.core')
        .provider('msModeService', msModeServiceProvider);

    function msModeServiceProvider() {
        var mode = 'user';
        var _appName = '';
        var service = this;

        service.setToUserMode = setToUserMode;
        service.setToApplicationMode = setToApplicationMode;
        service.isApplicationMode = isApplicationMode;
        service.isUserMode = isUserMode;

        function setToUserMode() {
            mode = 'user';
        };

        function setToApplicationMode() {
            mode = 'application'
        };

        function isApplicationMode(_mode) {
            return mode === 'application';
        };

        function isUserMode() {
            return mode === 'user';
        };

        this.$get = function(msNavigationService, msSchemasService, msDialogService) {
            var service = {
                setToUserMode: setToUserMode,
                setToApplicationMode: setToApplicationMode,
                isApplicationMode: isApplicationMode,
                isUserMode: isUserMode,
                renderApplicationModeNavigations: renderApplicationModeNavigations
            }

            return service;

            function renderApplicationModeNavigations(appId, appName) {
                msNavigationService.saveItem('application', {
                    title: appName,
                    group: true,
                    weight: 1,
                    hidden: function() {
                        return !isApplicationMode();
                    }
                });

                msNavigationService.saveItem('application.query', {
                    title: 'Query',
                    icon: 'icon-binoculars',
                    state: 'app.application_query',
                    stateParams: { 'appName': appName }
                });

                msNavigationService.saveItem('application.appsettings', {
                    title: 'Application Settings',
                    icon: 'icon-key'
                });

                msNavigationService.saveItem('application.appsettings.general', {
                    title: 'General',
                    state: 'app.application_appsettings_general',
                    stateParams: { 'appName': appName }
                });

                msNavigationService.saveItem('application.appsettings.keys', {
                    title: 'Keys',
                    state: 'app.application_appsettings_keys',
                    stateParams: { 'appName': appName }
                });

                msNavigationService.saveItem('application.appsettings.notifications', {
                    title: 'Push Notifications',
                    state: 'app.application_appsettings_notifications',
                    stateParams: { 'appName': appName }
                });

                msSchemasService.getSchemas(appId, appName, null, function(error, results) {
                    if (error) {
                        if (error.status === 401) {
                            return $state.go('app.pages_auth_login', { error: error });
                        }

                        return alert(error.statusText);
                    }

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

                    var schemas = results;

                    for (var i = 0; i < schemas.length; i++) {
                        var schema = schemas[i];

                        // Create navigation for schema
                        msNavigationService.saveItem('application.classes.' + schema.className, {
                            title: schema.className,
                            state: 'app.application_classes',
                            stateParams: {
                                'appName': appName,
                                'className': schema.className,
                                'appId': appId,
                                'objectId': null
                            }
                        });
                    }
                });
            };
        };
    };
})();
