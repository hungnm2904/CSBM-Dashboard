(function() {
    'use strict';

    angular
        .module('app.pages.homescreen', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {
        // State
        $stateProvider.state('app.pages_homescreen', {
            url: '/homescreen',
            views: {
                'main@': {
                    templateUrl: 'app/main/main.html',
                    controller: 'MainController as vm'
                },
                'content@app.pages_homescreen': {
                    templateUrl: 'app/main/pages/homescreen/homescreen.html',
                    controller: 'HomeScreenController as vm'
                }
            },
            bodyClass: 'homescreen'
        });
    }
})();
