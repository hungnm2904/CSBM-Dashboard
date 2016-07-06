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
                    templateUrl: 'app/main/pages/homescreen/homescreen.html',
                    controller: 'MainController as vm'
                }
            },
            bodyClass: 'homescreen'
        });
    }
})();
