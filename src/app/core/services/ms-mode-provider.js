(function() {
    'use strict';

    angular
        .module('app.core')
        .provider('msModeService', msModeServiceProvider);

    function msModeServiceProvider($stateProvider) {
        var _mode = 'user';
        var _appName = '';
        var _applicationNavigationsExist = false;
        var service = this;

        service.setToUserMode = setToUserMode;
        service.setToApplicationMode = setToApplicationMode;
        service.setToDocsMode = setToDocsMode;
        service.isApplicationMode = isApplicationMode;
        service.isUserMode = isUserMode;
        service.isDocsMode = isDocsMode;
        service.addState = addState;

        function setToUserMode() {
            _mode = 'user';
        };

        function setToApplicationMode() {
            _mode = 'application'
        };

        function setToDocsMode() {
            _mode = 'docs'
        };

        function isUserMode() {
            return _mode === 'user';
        };

        function isApplicationMode() {
            return _mode === 'application';
        };

        function isDocsMode() {
            return _mode === 'docs';
        };

        function addState(name, state) {
            $stateProvider.state(name, state);
        };

        this.$get = function($state, msNavigationService, msSchemasService, msDialogService,
            msApplicationService) {

            var service = {
                setToUserMode: setToUserMode,
                setToApplicationMode: setToApplicationMode,
                setToDocsMode: setToDocsMode,
                isApplicationMode: isApplicationMode,
                isUserMode: isUserMode,
                isDocsMode: isDocsMode,
                renderApplicationNavigations: renderApplicationNavigations,
                renderiOSDocsGuideNavigations: renderiOSDocsGuideNavigations,
                renderDevManagementNavigations: renderDevManagementNavigations,
                renderAdminManagementNavigations: renderAdminManagementNavigations,
                renderGuestNavigations: renderGuestNavigations,
                renderAndroidDocsGuideNavigations: renderAndroidDocsGuideNavigations
            }

            return service;

            function _clearNavigations(argument) {
                msNavigationService.clearNavigation();
            };

            function _checkState(states, name, callback) {
                for (var i = 0; i < states.length; i++) {
                    if (states[i].name === name) {
                        return callback(false);
                    }
                }

                callback(true);
            };

            function _renderClassesNavigations(appId, appName, className) {
                var states = $state.get();

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
                            title: 'Create new class',
                            function: function(ev) {
                                msDialogService.showDialog(ev, 'app/core/services/dialogs/addClassDialog.html');
                            }
                        }
                    });

                    var schemas = results;

                    for (var i = 0; i < schemas.length; i++) {
                        var schema = schemas[i];
                        var title = schema.className;
                        if (title.includes('_')) {
                            title = title.split('_')[1];
                        }

                        // Create navigation for schema
                        msNavigationService.saveItem('application.classes.' + schema.className, {
                            title: title,
                            state: 'app.application_classes_' + schema.className,
                            stateParams: {
                                'appName': appName,
                                'className': schema.className,
                                'appId': appId,
                                'objectId': null
                            }
                        });

                        var name = 'app.application_classes_' + schema.className;
                        var state = {
                            url: '/apps/:appName/classes/:className',
                            params: {
                                appId: null,
                                objectId: null
                            },
                            views: {
                                'content@app': {
                                    templateUrl: 'app/main/dashboard/application/classes/classes.html',
                                    controller: 'ClassesController as vm'
                                }
                            }
                        };

                        _checkState(states, name, function(results) {
                            if (results) {
                                addState(name, state);
                            }
                        });
                    }

                    if (className) {
                        $state.go('app.application_classes_' + className, {
                            'appId': appId,
                            'appName': appName,
                            'className': className,
                            'objectId': null
                        });
                    }
                });
            };

            function _renderQueryNavigations(appName) {
                msNavigationService.saveItem('application.query', {
                    title: 'Query',
                    icon: 'icon-binoculars',
                    state: 'app.application_query',
                    stateParams: { 'appName': appName }
                });
            };

            function _renderDiagramNavigations(appName) {
                msNavigationService.saveItem('application.diagram', {
                    title: 'Diagram',
                    icon: 'icon-view-dashboard',
                    state: 'app.application_diagram',
                    stateParams: { 'appName': appName }
                });
            };

            function _renderApplicationSettingsNavigations(appName) {
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
            };

            function _renderApplicationNavigations(appId, appName, className) {
                msNavigationService.saveItem('application', {
                    title: appName,
                    group: true,
                    weight: 1
                });

                _renderQueryNavigations(appName);
                _renderDiagramNavigations(appName);
                _renderApplicationSettingsNavigations(appName);
                _renderClassesNavigations(appId, appName, className);
            }

            function renderDevManagementNavigations() {
                _clearNavigations();
                msNavigationService.saveItem('management', {
                    title: 'Management',
                    group: true,
                    weight: 1
                });

                msNavigationService.saveItem('management.applications', {
                    title: 'Applications',
                    icon: 'icon-apps',
                    state: 'app.management_applications'
                });
            };

            function renderAdminManagementNavigations() {
                _clearNavigations()
                msNavigationService.saveItem('admin', {
                    title: 'Admin',
                    group: true,
                    weight: 1
                });

                msNavigationService.saveItem('admin.applications', {
                    title: 'Applications',
                    icon: 'icon-apps',
                    state: 'app.admin_applications'
                });

                msNavigationService.saveItem('admin.users', {
                    title: 'User',
                    icon: 'icon-apps',
                    state: 'app.admin_users'
                });
            };

            function renderGuestNavigations(appName) {
                _clearNavigations();

                msNavigationService.saveItem('application', {
                    title: appName,
                    group: true,
                    weight: 1
                });

                _renderQueryNavigations(appName);
                _renderDiagramNavigations(appName);
            };

            function renderApplicationNavigations(appId, appName, className) {
                _clearNavigations();
                if (!appId) {
                    msApplicationService.getAppId(appName, function(error, results) {
                        if (error) {
                            return console.log(error);
                        }

                        appId = results.appId;
                        _renderApplicationNavigations(appId, appName, className);
                        _applicationNavigationsExist = true;
                    });
                } else {
                    _renderApplicationNavigations(appId, appName, className);
                    _applicationNavigationsExist = true;
                }
            };

            function renderiOSDocsGuideNavigations() {
                _clearNavigations();
                msNavigationService.saveItem('guide', {
                    title: 'Guide',
                    group: true,
                    weight: 1
                });

                msNavigationService.saveItem('guide.getting-started', {
                    title: 'Getting Started',
                    state: 'app.docs_ios_guide_getting-started'
                });

                msNavigationService.saveItem('guide.objects', {
                    title: 'Objects'
                });

                msNavigationService.saveItem('guide.objects.beobject', {
                    title: 'BEObject',
                    state: 'app.docs_ios_guide_beobject'
                });
            };

            function renderAndroidDocsGuideNavigations() {
                _clearNavigations();
                msNavigationService.saveItem('guide', {
                    title: 'Guide',
                    group: true,
                    weight: 1
                });

                msNavigationService.saveItem('guide.getting-started', {
                    title: 'Getting Started',
                    state: 'app.docs_android_guide_getting-started'
                });
            };
        };
    };
})();
