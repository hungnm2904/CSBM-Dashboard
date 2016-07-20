(function() {
    'use strict';

    angular
        .module('app.docs', [
            'app.docs.ios.guide.getting-started',
            'app.docs.ios.guide.beobject',
            'app.docs.android.guide.getting-started'
        ])
        .config(config)
        .run(run);

    /** @ngInject */
    function config($stateProvider, msDocsServiceProvider) {
        $stateProvider.state('app.docs', {
            url: '/docs',
            views: {
                'main@': {
                    templateUrl: 'app/main/main.html',
                    controller: 'MainController as vm'
                },
                'content@app.docs': {
                    templateUrl: 'app/main/docs/docs.html',
                    controller: 'DocsController as vm'
                }
            }
        });
    };

    function run($rootScope, msModeService) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            if (toState.name.includes('docs')) {
                msModeService.setToDocsMode();
                if (!fromState.name.includes('ios') && !fromState.name.includes('android')) {
                    if (toState.name.includes('ios')) {
                        msModeService.renderiOSDocsGuideNavigations();
                    } else {
                        msModeService.renderAndroidDocsGuideNavigations();
                    }
                }
            }
        });
    };

})();
