(function() {
    'use strict';

    angular
        .module('app.pages.auth.login', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {
        // State
        $stateProvider.state('app.pages_auth_login', {
            url: '/login',
            // params: {
            //     error: null
            // },
            views: {
                'main@': {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller: 'MainController as vm'
                },
                'content@app.pages_auth_login': {
                    templateUrl: 'app/main/pages/auth/login/login.html',
                    controller: 'LoginController as vm'
                }
            },
            bodyClass: 'login'
        });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/pages/auth/login');
    }

})();
