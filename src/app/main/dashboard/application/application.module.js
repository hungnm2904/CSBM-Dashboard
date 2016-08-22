(function() {
    'use strict';

    angular
        .module('app.application', [
            'app.application.diagram',
            'app.application.query',
            'app.application.classes',
            'app.application.push',
            'app.application.appsettings.general',
            'app.application.appsettings.keys',
            'app.application.appsettings.notifications'
        ])
        .config(config)
        .run(run);

    /** @ngInject */
    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when('/:mode/:appName/classes/:className', ['$state', '$stateParams', '$location', 'msModeService',
            function($state, $stateParams, $location, msModeService) {
                if (!$state.current.name) {

                    console.log('Render $urlRouterProvider');

                    var path = $location.path().split('/');
                    var mode = path[1];
                    var appName = path[2];
                    var className = path[4];
                    if (mode === 'apps') {
                        msModeService.renderApplicationNavigations(mode, null, appName, className);
                    } else {
                        var collaborationRole = mode.split('--')[1];
                        if (collaborationRole === 'dev') {
                            msModeService.getCollaborationRole(null, appName,
                                function(error, results) {

                                    if (error) {
                                        if (error.status === 401) {
                                            return $state.go('app.pages_auth_login');
                                        }

                                        return alert(error.statusText);
                                    }

                                    if (!msModeService.isDevCollaborationRole()) {
                                        $state.go('app.pages_homescreen');
                                    } else {
                                        msModeService.renderCollaborationNavigations(mode, null, appName, className);
                                    }
                                });
                        } else if (collaborationRole === 'guest') {
                            $state.go('app.pages_homescreen');
                        }
                    }
                }
            }
        ]);
    };

    function run($rootScope, $state, $stateParams, $location, msSchemasService, msNavigationService,
        msModeService, msApplicationService, msDialogService) {


        var renderNavigations = function(toAppName, mode, path) {
            msApplicationService.getAppId(toAppName, function(error, results) {
                if (error) {
                    if (error.status === 401) {
                        return $state.go('app.pages_auth_login');
                    }

                    return alert(error.statusText);
                }

                var appId = results.appId;

                if (mode === 'apps') {
                    msModeService.renderApplicationNavigations(mode, appId, toAppName, '');
                } else {
                    var collaborationRole = mode.split('--')[1];
                    if (collaborationRole.trim() === 'dev') {
                        msModeService.getCollaborationRole(appId, toAppName,
                            function(error, results) {

                                if (error) {
                                    if (error.status === 401) {
                                        return $state.go('app.pages_auth_login');
                                    }

                                    return alert(error.statusText);
                                }

                                if (!msModeService.isDevCollaborationRole()) {
                                    $state.go('app.pages_homescreen');
                                } else {
                                    msModeService.renderCollaborationNavigations(mode, appId, toAppName, null);
                                }
                            });
                    } else if (collaborationRole.trim() === 'guest') {
                        msModeService.getCollaborationRole(appId, toAppName,
                            function(error, results) {

                                if (error) {
                                    if (error.status === 401) {
                                        return $state.go('app.pages_auth_login');
                                    }

                                    return alert(error.statusText);
                                }

                                if (!msModeService.isGuestCollaborationRole()) {
                                    $state.go('app.pages_homescreen');
                                } else {
                                    var state = 'app.application_diagram';
                                    if (path[3] === 'query') {
                                        state = 'app.application_query'
                                    }

                                    msModeService.renderGuestNavigations(mode, toAppName, state);
                                }
                            });
                    }
                }
            });
        }

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            var toAppName = toParams.appName;
            var mode = toParams.mode;

            if (toAppName) {
                var fromAppName = fromParams.appName;
                if (toAppName != fromAppName) {
                    var path = toState.url.split('/');
                    if (!fromAppName) {
                        if (path[3] === 'settings' || path[3] === 'diagram' || path[3] === 'query' || path[3] === 'push') {
                            renderNavigations(toAppName, mode, path);
                        }
                    } else {
                        if (mode === 'apps' || mode === 'collaboration--guest' || mode === 'collaboration--dev') {

                            console.log('Render $stateChangeStart');

                            renderNavigations(toAppName, mode, path);
                        }
                    }
                }
            }
        });

        $rootScope.$on('schemas-changed', function(event, args) {
            var appId = args.appId;
            var appName = args.appName;
            var className = args.className;
            var mode = $location.path().split('/')[1];

            msModeService.renderApplicationNavigations(mode, appId, appName, className);
        });
    };
})();
