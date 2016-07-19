(function() {
    'use strict';

    angular
        .module('app.docs.android.guide.getting-started', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {
        $stateProvider.state('app.docs_android_guide_getting-started', {
            url: '/docs/android/guide/getting-started',
            views: {
                'content@app': {
                    templateUrl: 'app/main/docs/android/getting-started/getting-started.html'
                }
            }
        });
    };

})();
