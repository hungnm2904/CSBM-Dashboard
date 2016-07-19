(function() {
    'use strict';

    angular
        .module('app.core')
        .provider('msDocsService', msDocsServiceProvider);

    function msDocsServiceProvider() {
        var service = this;
        var _docs = [{
            state: 'app.docs_guide_getting-started',
            url: '/docs/ios/guide/getting-started',
            templateUrl: 'app/main/docs/ios/getting-started/getting-started.html'
        }];
        var iosDocs = [{
            state: 'app.docs_guide_getting-started',
            url: '/docs/ios/guide/getting-started',
            templateUrl: 'app/main/docs/ios/getting-started/getting-started.html'
        }];
        var androidDocs = [{
            state: 'app.docs_guide_getting-started',
            url: '/docs/android/guide/getting-started',
            templateUrl: 'app/main/docs/android/getting-started/getting-started.html'
        }];

        service.getDocs = getDocs;
        service.setToiOSDocs = setToiOSDocs;
        service.setToAndroidDocs = setToAndroidDocs;

        function setToiOSDocs() {
            _docs = iosDocs;
        };

        function setToAndroidDocs() {
            _docs = androidDocs;
        };

        function getDocs() {
            return _docs;
        };

        this.$get = function() {
            var service = {
                getDocs: getDocs,
                setToiOSDocs: setToiOSDocs,
                setToAndroidDocs: setToAndroidDocs
            };

            return service;
        };
    };
})();
