(function() {
    'use strict';

    /**
     * Main module of the Fuse
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

            // Pages
            'app.pages',

            // Dashboards
            'app.dashboards'
        ]);
})();
