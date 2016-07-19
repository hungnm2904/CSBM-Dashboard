(function() {
    'use strict';

    angular
        .module('app.docs.ios.guide.getting-started', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {
        $stateProvider.state('app.docs_ios_guide_getting-started', {
            url: '/docs/ios/guide/getting-started',
            views: {
                'content@app': {
                    templateUrl: 'app/main/docs/ios/getting-started/getting-started.html'
                }
            }
        });
    };

})();
