(function() {
    'use strict';

    angular
        .module('app.pages.homescreen', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {
        // State
        $stateProvider.state('app.pages_homescreen', {
            url: '/',
            views: {
                'main@': {
                    templateUrl: 'app/main/home-main.html',
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
