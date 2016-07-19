(function() {
    'use strict';

    angular
        .module('app.docs.ios.guide.beobject', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {
        $stateProvider.state('app.docs_ios_guide_beobject', {
            url: '/docs/ios/guide/objects/beobject',
            views: {
                'content@app': {
                    templateUrl: 'app/main/docs/ios/objects/beobject/beobject.html'
                }
            }
        });
    };

})();
