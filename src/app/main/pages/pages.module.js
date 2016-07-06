(function() {
    'use strict';

    angular
        .module('app.pages', [
            'app.pages.auth.login',
            'app.pages.auth.register',
            'app.pages.homescreen'
        ])
        .config(config);
        // .run(run);

    /** @ngInject */
    function config(msNavigationServiceProvider) {
        // Navigation
    };

})();
