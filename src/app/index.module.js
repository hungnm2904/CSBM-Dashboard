(function() {
    'use strict';

    /**
     * Main module of the masamune
     */
    angular
        .module('masamune', [

            // Core
            'app.core',

            // Navigation
            'app.navigation',

            // Toolbar
            'app.toolbar',

            // Quick panel
            'app.quick-panel',

            // Sample
            'app.pages',

            // Management
            'app.management',

            // Other applications
            'app.otherApps',

            // Application
            'app.application',

            //Admin
            'app.admin',

            // Documents for frameworks
            'app.docs'
        ]);
})();
