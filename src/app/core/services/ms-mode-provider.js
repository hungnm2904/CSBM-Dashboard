(function() {
    'use strict';

    angular
        .module('app.core')
        .provider('msModeService', msModeServiceProvider);

    function msModeServiceProvider($stateProvider) {

        var _mode = 'application';
        var _applicationNavigationsExist = false;
        var _collaborationRole = undefined;
        var service = this;

        service.setToAppMode = setToAppMode;
        service.setToCollaborationMode = setToCollaborationMode;
        service.setCollaborationRole = setCollaborationRole;
        service.isDevCollaborationRole = isDevCollaborationRole;
        service.isGuestCollaborationRole = isGuestCollaborationRole;
        service.isCollaborationMode = isCollaborationMode;
        service.addState = addState;

        function setToAppMode() {
            _mode = 'application';
        };

        function setToCollaborationMode() {
            _mode = 'collaboration';
        };

        function setCollaborationRole(role) {
            _collaborationRole = role;
        };

        function isDevCollaborationRole() {
            return _collaborationRole === 'Dev';
        };

        function isGuestCollaborationRole() {
            return _collaborationRole === 'Guest';
        }

        function isCollaborationMode() {
            return _mode === 'collaboration';
        };

        function addState(name, state) {
            $stateProvider.state(name, state);
        };

        this.$get = function($state, $http, msNavigationService, msSchemasService, msDialogService,
            msApplicationService, msConfigService, msUserService) {

            var _domain = (msConfigService.getConfig()).domain;
            var service = {
                setToAppMode: setToAppMode,
                setToCollaborationMode: setToCollaborationMode,
                setCollaborationRole: setCollaborationRole,
                isDevCollaborationRole: isDevCollaborationRole,
                isGuestCollaborationRole: isGuestCollaborationRole,
                isCollaborationMode: isCollaborationMode,
                renderApplicationNavigations: renderApplicationNavigations,
                renderCollaborationNavigations: renderCollaborationNavigations,
                renderGuestNavigations: renderGuestNavigations,
                renderDevManagementNavigations: renderDevManagementNavigations,
                renderAdminManagementNavigations: renderAdminManagementNavigations,
                renderiOSDocsGuideNavigations: renderiOSDocsGuideNavigations,
                renderAndroidDocsGuideNavigations: renderAndroidDocsGuideNavigations,
                getCollaborationRole: getCollaborationRole
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

            function _renderClassesNavigations(mode, appId, appName, className) {
                var states = $state.get();

                msSchemasService.getSchemas(appId, appName, null, function(error, results) {
                    if (error) {
                        if (error.status === 401) {
                            return $state.go('app.pages_auth_login', { error: error });
                        }

                        return alert(error.statusText);
                    }

                    msNavigationService.saveItem('application.classes', {
                        title: 'Tables',
                        icon: 'icon-library-plus',
                        group: true,
                        button: {
                            title: 'Create new table',
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
                                'mode': mode,
                                'objectId': undefined
                            }
                        });

                        var name = 'app.application_classes_' + schema.className;
                        var state = {
                            url: '/:mode/:appName/classes/:className',
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
                            'mode': mode,
                            'objectId': null
                        });
                    }
                });
            };

            function _renderQueryNavigations(mode, appName) {
                msNavigationService.saveItem('application.query', {
                    title: 'Query',
                    icon: 'icon-binoculars',
                    state: 'app.application_query',
                    stateParams: { 'mode': mode, 'appName': appName }
                });
            };

            function _renderDiagramNavigations(mode, appName) {
                msNavigationService.saveItem('application.diagram', {
                    title: 'Diagram',
                    icon: 'icon-view-dashboard',
                    state: 'app.application_diagram',
                    stateParams: { 'mode': mode, 'appName': appName }
                });
            };

            function _renderApplicationSettingsNavigations(mode, appName) {
                msNavigationService.saveItem('application.appsettings', {
                    title: 'Application Settings',
                    icon: 'icon-key'
                });

                msNavigationService.saveItem('application.appsettings.general', {
                    title: 'General',
                    state: 'app.application_appsettings_general',
                    stateParams: { 'mode': mode, 'appName': appName }
                });

                msNavigationService.saveItem('application.appsettings.keys', {
                    title: 'Keys',
                    state: 'app.application_appsettings_keys',
                    stateParams: { 'mode': mode, 'appName': appName }
                });

                msNavigationService.saveItem('application.appsettings.notifications', {
                    title: 'Push Notifications',
                    state: 'app.application_appsettings_notifications',
                    stateParams: { 'mode': mode, 'appName': appName }
                });
            };

            function _renderApplicationNavigations(mode, appId, appName, className) {
                msNavigationService.saveItem('application', {
                    title: appName,
                    group: true,
                    weight: 1
                });

                _renderQueryNavigations(mode, appName);
                _renderDiagramNavigations(mode, appName);
                _renderApplicationSettingsNavigations(mode, appName);
                _renderClassesNavigations(mode, appId, appName, className);
            }

            function renderDevManagementNavigations() {
                _clearNavigations()
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

            function _renderCollaborationNavigations(mode, appId, appName, className) {
                msNavigationService.saveItem('application', {
                    title: appName,
                    group: true,
                    weight: 1
                });

                _renderQueryNavigations(mode, appName);
                _renderDiagramNavigations(mode, appName);
                _renderClassesNavigations(mode, appId, appName, className);
            };

            function renderCollaborationNavigations(mode, appId, appName, className) {
                _clearNavigations();
                if (!appId) {
                    msApplicationService.getAppId(appName, function(error, results) {
                        if (error) {
                            return console.log(error);
                        }

                        appId = results.appId;
                        _renderCollaborationNavigations(mode, appId, appName, className);
                        _applicationNavigationsExist = true;
                    });
                } else {
                    _renderCollaborationNavigations(mode, appId, appName, className);
                    _applicationNavigationsExist = true;
                }
            };

            function renderGuestNavigations(mode, appName, state) {
                _clearNavigations();

                msNavigationService.saveItem('application', {
                    title: appName,
                    group: true,
                    weight: 1
                });

                _renderQueryNavigations(mode, appName);
                _renderDiagramNavigations(mode, appName);
                $state.go(state, { 'mode': mode, 'appName': appName });
            };

            function renderApplicationNavigations(mode, appId, appName, className) {
                _clearNavigations();
                if (!appId) {
                    msApplicationService.getAppId(appName, function(error, results) {
                        if (error) {
                            return console.log(error);
                        }

                        appId = results.appId;
                        _renderApplicationNavigations(mode, appId, appName, className);
                        _applicationNavigationsExist = true;
                    });
                } else {
                    _renderApplicationNavigations(mode, appId, appName, className);
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

            function _getCollaborationRole(appId, callback) {
                var accessToken = msUserService.getAccessToken();
                $http({
                    method: 'GET',
                    url: _domain + '/collaborations/' + appId,
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                }).then(function(response) {
                    setCollaborationRole(response.data.role);
                    callback(null, response.data.role);
                }, function(response) {
                    callback(response);
                });
            };

            function getCollaborationRole(appId, appName, callback) {
                if (_collaborationRole) {
                    return _collaborationRole;
                } else {
                    if (appId) {
                        _getCollaborationRole(appId, callback);
                    } else {
                        msApplicationService.getAppId(appName, function(error, results) {
                            if (error) {
                                return callback(error);
                            }

                            appId = results.appId;
                            _getCollaborationRole(appId, callback);
                        });
                    }
                }
            };

        };
    };
})();
