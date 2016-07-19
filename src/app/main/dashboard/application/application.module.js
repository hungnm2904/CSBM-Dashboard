(function() {
    'use strict';

    angular
        .module('app.application', [
            'app.application.diagram',
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

    function run($rootScope, $state, $stateParams, $location, msSchemasService, msNavigationService,
        msModeService, msApplicationService, msDialogService) {

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            var toAppName = toParams.appName;
            if (toAppName) {
                var fromAppName = fromParams.appName;
                if (toAppName != fromAppName) {
                    var path = toState.url.split('/');
                    if (path.length < 5) {
                        msApplicationService.getAppId(toAppName, function(error, results) {
                            if (error) {
                                if (error.status === 401) {
                                    return $state.go('app.pages_auth_login');
                                }

                                return alert(error.statusText);
                            }

                            var appId = results.appId;
                            msModeService.renderApplicationNavigations(appId, toAppName);
                        });
                    }
                }
            }
        });

        $rootScope.$on('schemas-changed', function(event, args) {
            var appId = args.appId;
            var appName = args.appName;
            msModeService.renderApplicationNavigations(appId, appName);
        });
    };
})();
