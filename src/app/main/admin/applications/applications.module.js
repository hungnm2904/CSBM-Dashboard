(function() {
    'use strict';

    angular
        .module('app.admin.applications', ['datatables'])
        .config(config);

    function config($stateProvider, msApiProvider) {
        $stateProvider.state('app.admin_applications', {
            url: '/admin/applications',
            views: {
                'content@app': {
                    templateUrl: 'app/main/admin/applications/applications.html',
                    controller: 'ManageApplicationsController as vm'
                }
            }
        });
    }
})();
